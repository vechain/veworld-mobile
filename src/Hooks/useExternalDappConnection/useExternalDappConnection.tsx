import { useCallback, useEffect } from "react"
import { Linking } from "react-native"
import DeviceInfo from "react-native-device-info"
import nacl from "tweetnacl"
import { decodeBase64, encodeBase64 } from "tweetnacl-util"
import { useDeepLinksSession } from "~Components/Providers/DeepLinksProvider"
import { NETWORK_TYPE } from "~Model"
import {
    useAppSelector,
    selectSignKeyPair,
    selectSelectedNetwork,
    useAppDispatch,
    newExternalDappSession,
    setSignKeyPair,
    selectSelectedAccountOrNull,
    deleteExternalDappSession,
    selectExternalDappSessions,
} from "~Storage/Redux"
import { DAppUtils, error } from "~Utils"
import { DeepLinkError } from "~Utils/ErrorMessageUtils"
import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
import { assertDefined } from "~Utils/TypeUtils"

type OnConnectParams = {
    dappPublicKey: string
    redirectUrl: string
    dappName: string
    dappUrl?: string
}

type OnDappDisconnectedParams = {
    dappPublicKey: string
    network: NETWORK_TYPE
    redirectUrl: string
}

type OnSuccessParams = {
    redirectUrl: string
    data: object
    publicKey: string
}

export const useExternalDappConnection = () => {
    const signKeyPair = useAppSelector(selectSignKeyPair)
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const { setCurrentDappPublicKey } = useDeepLinksSession()
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

                const params = new URLSearchParams({
                    public_key: encodeBase64(keyPair.publicKey),
                    data: encodeBase64(encrypted),
                    nonce: encodeBase64(nonce),
                })
                await Linking.openURL(`${redirectUrl}?${params.toString()}`)
                setCurrentDappPublicKey(null)
            } catch (_err: unknown) {
                const err = new DeepLinkError(DeepLinkErrorCode.InternalError)

                error("EXTERNAL_DAPP_CONNECTION", err)

                const params = new URLSearchParams({
                    errorMessage: err.message,
                    errorCode: err.code.toString(),
                })
                await Linking.openURL(`${redirectUrl}?${params.toString()}`)
                setCurrentDappPublicKey(null)
            }
        },
        [dispatch, network.type, selectedAccount, signKeyPair, setCurrentDappPublicKey],
    )

    const onDappDisconnected = useCallback(
        async ({ dappPublicKey, network: dappNetwork, redirectUrl }: OnDappDisconnectedParams) => {
            // console.log("dappPublicKey", dappPublicKey)
            // console.log("dappNetwork", dappNetwork)
            // console.log("redirectUrl", redirectUrl)
            dispatch(deleteExternalDappSession({ appPublicKey: dappPublicKey, network: dappNetwork }))
            await Linking.openURL(`${redirectUrl}`)
            setCurrentDappPublicKey(null)
        },
        [dispatch, setCurrentDappPublicKey],
    )

    const getSessionKeyPair = useCallback(
        (publicKey: string) => {
            const session = externalDappSessions[publicKey]

            //TODO: handle missing session
            if (!session) {
                return null
            }

            return {
                publicKey: session.keyPair.publicKey,
                secretKey: session.keyPair.privateKey,
            }
        },
        [externalDappSessions],
    )

    /**
     * Called when the operation requested form the external app is successful
     * @param redirectUrl - The redirect url to send the data to
     * @param data - The encrypted data to send to the redirect url
     * @param nonce - The nonce to decrypt the data
     * @param publicKey - The public key to decrypt the data
     */
    const onSuccess = useCallback(
        async ({ redirectUrl, data, publicKey }: OnSuccessParams) => {
            const sessionKeyPair = getSessionKeyPair(publicKey)
            assertDefined(sessionKeyPair)

            const [nonce, encryptedPayload] = DAppUtils.encryptPayload(
                JSON.stringify(data),
                publicKey,
                sessionKeyPair.secretKey,
            )

            const params = new URLSearchParams({
                data: encodeBase64(encryptedPayload),
                nonce: encodeBase64(nonce),
                public_key: publicKey,
            })
            await Linking.openURL(`${redirectUrl}?${params.toString()}`)
            setCurrentDappPublicKey(null)
        },
        [getSessionKeyPair, setCurrentDappPublicKey],
    )

    /**
     * Called when the operation requested form the external app is failed
     * @param redirectUrl - The redirect url to send the data to
     */
    const onFailure = useCallback(
        async (redirectUrl: string) => {
            const err = new DeepLinkError(DeepLinkErrorCode.TransactionRejected)
            const params = new URLSearchParams({
                errorMessage: err.message,
                errorCode: err.code.toString(),
            })

            await Linking.openURL(`${redirectUrl}?${params.toString()}`)
            setCurrentDappPublicKey(null)
        },
        [setCurrentDappPublicKey],
    )

    /**
     * Called when the operation requested form the external app is rejected by the user
     * @param redirectUrl - The redirect url to send the data to
     */
    const onRejectRequest = useCallback(
        async (redirectUrl: string) => {
            const err = new DeepLinkError(DeepLinkErrorCode.UserRejected)
            const params = new URLSearchParams({
                errorMessage: err.message,
                errorCode: err.code.toString(),
            })
            await Linking.openURL(`${redirectUrl}?${params.toString()}`)
            setCurrentDappPublicKey(null)
        },
        [setCurrentDappPublicKey],
    )

    return {
        onConnect,
        getKeyPairFromPrivateKey,
        onRejectRequest,
        onSuccess,
        onFailure,
        onDappDisconnected,
        getSessionKeyPair,
    }
}
