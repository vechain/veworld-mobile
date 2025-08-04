import { useCallback, useEffect } from "react"
import { Linking } from "react-native"
import DeviceInfo from "react-native-device-info"
import nacl from "tweetnacl"
import { decodeBase64, encodeBase64 } from "tweetnacl-util"
import { TransactionRequest } from "~Model"
import {
    useAppSelector,
    selectSignKeyPair,
    selectSelectedNetwork,
    useAppDispatch,
    newExternalDappSession,
    setSignKeyPair,
    selectSelectedAccountOrNull,
    selectExternalDappSessions,
} from "~Storage/Redux"
import { error } from "~Utils"
import { DeepLinkError } from "~Utils/ErrorMessageUtils"
import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"

type OnConnectParams = {
    dappPublicKey: string
    redirectUrl: string
    dappName: string
    dappUrl?: string
}

export const useExternalDappConnection = () => {
    const signKeyPair = useAppSelector(selectSignKeyPair)
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const externalDappSessions = useAppSelector(selectExternalDappSessions)

    const dispatch = useAppDispatch()

    const getKeyPairFromPrivateKey = useCallback((privateKey: string) => {
        return nacl.box.keyPair.fromSecretKey(decodeBase64(privateKey))
    }, [])

    useEffect(() => {
        //Generate a new sign key pair if it doesn't exist
        if (!signKeyPair.publicKey || !signKeyPair.privateKey) {
            const keyPair = nacl.sign.keyPair()
            dispatch(
                setSignKeyPair({
                    publicKey: encodeBase64(keyPair.publicKey),
                    privateKey: encodeBase64(keyPair.secretKey),
                }),
            )
        }
    }, [signKeyPair, dispatch])

    const onConnect = useCallback(
        async ({ dappPublicKey, redirectUrl, dappName, dappUrl }: OnConnectParams) => {
            if (!dappPublicKey || !selectedAccount || !signKeyPair) return

            try {
                const keyPair = nacl.box.keyPair()
                const sharedSecret = nacl.box.before(decodeBase64(dappPublicKey), keyPair.secretKey)

                const sessionData = JSON.stringify({
                    app_id: DeviceInfo.getBundleId(),
                    network: network.type,
                    address: selectedAccount.address,
                    timestamp: new Date().getTime(),
                })

                const sessionDataBytes = encodeBase64(
                    nacl.sign(Buffer.from(sessionData), decodeBase64(signKeyPair.privateKey)),
                )

                const response = JSON.stringify({
                    public_key: encodeBase64(keyPair.publicKey),
                    address: selectedAccount.address,
                    session: sessionDataBytes,
                })

                const nonce = nacl.randomBytes(24)
                const encrypted = nacl.box.after(Buffer.from(response), nonce, sharedSecret)

                dispatch(
                    newExternalDappSession({
                        network: network.type,
                        keyPair: {
                            publicKey: encodeBase64(keyPair.publicKey),
                            privateKey: encodeBase64(keyPair.secretKey),
                        },
                        appPublicKey: dappPublicKey,
                        appUrl: dappUrl ?? "",
                        appName: dappName,
                        sharedSecret: encodeBase64(sharedSecret),
                        address: selectedAccount.address,
                    }),
                )

                await Linking.openURL(
                    `${redirectUrl}/onVeWorldConnected?public_key=${encodeURIComponent(
                        encodeBase64(keyPair.publicKey),
                    )}&data=${encodeURIComponent(encodeBase64(encrypted))}&nonce=${encodeURIComponent(
                        encodeBase64(nonce),
                    )}`,
                )
            } catch (_err: unknown) {
                const err = new DeepLinkError(DeepLinkErrorCode.InternalError)
                error("EXTERNAL_DAPP_CONNECTION", err)
                await Linking.openURL(`${redirectUrl}?errorMessage=${err.message}&errorCode=${err.name}`)
            }
        },
        [dispatch, network.type, selectedAccount, signKeyPair],
    )

    const parseTransactionRequest = useCallback(
        async (encodedRequest: string): Promise<TransactionRequest | undefined> => {
            const request = decodeURIComponent(encodedRequest)
            const { payload: encPayload, ...decodedRequest } = JSON.parse(
                new TextDecoder().decode(decodeBase64(request)),
            )
            try {
                const session = externalDappSessions[decodedRequest.publicKey]

                if (!session) {
                    await Linking.openURL(
                        `${decodedRequest.redirectUrl}?error=${encodeURIComponent("Unauthorized")}&error_code=401`,
                    )
                    return
                }

                const KP = nacl.box.keyPair.fromSecretKey(decodeBase64(session.keyPair.privateKey))

                // Decrypt the payload
                const sharedSecret = nacl.box.before(decodeBase64(decodedRequest.publicKey), KP.secretKey)

                const decryptedPayload = nacl.box.open.after(
                    decodeBase64(encPayload),
                    decodeBase64(decodedRequest.nonce),
                    sharedSecret,
                )

                if (!decryptedPayload) {
                    await Linking.openURL(
                        `${decodedRequest.redirectUrl}?error=${encodeURIComponent("Invalid payload")}&error_code=400`,
                    )
                    return
                }

                const payload = JSON.parse(new TextDecoder().decode(decryptedPayload))

                const req = {
                    ...payload.transaction,
                    ...decodedRequest,
                }
                return req as TransactionRequest
            } catch (e) {
                const err = new DeepLinkError(DeepLinkErrorCode.InternalError)
                error("EXTERNAL_DAPP_CONNECTION", err)
                await Linking.openURL(`${decodedRequest.redirectUrl}?errorMessage=${err.message}&errorCode=${err.code}`)
                return
            }
        },
        [externalDappSessions],
    )

    const onTransactionSuccess = useCallback(async (redirectUrl: string, txId: string) => {
        await Linking.openURL(`${redirectUrl}/onTransactionSuccess?id=${encodeURIComponent(txId)}`)
    }, [])

    const onTransactionFailure = useCallback(async (redirectUrl: string) => {
        const err = new DeepLinkError(DeepLinkErrorCode.TransactionRejected)
        await Linking.openURL(
            `${redirectUrl}/onTransactionFailure?errorMessage=${encodeURIComponent(err.message)}&errorCode=${err.code}`,
        )
    }, [])

    const onRejectRequest = useCallback(async (redirectUrl: string) => {
        const err = new DeepLinkError(DeepLinkErrorCode.UserRejected)
        await Linking.openURL(`${redirectUrl}?errorMessage=${encodeURIComponent(err.message)}&errorCode=${err.code}`)
    }, [])

    return {
        onConnect,
        getKeyPairFromPrivateKey,
        onRejectRequest,
        parseTransactionRequest,
        onTransactionSuccess,
        onTransactionFailure,
    }
}
