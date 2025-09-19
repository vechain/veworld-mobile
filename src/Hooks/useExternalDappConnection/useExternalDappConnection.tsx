import { useCallback, useEffect } from "react"
import { Linking } from "react-native"
import nacl from "tweetnacl"
import { decodeBase64, encodeBase64 } from "tweetnacl-util"
import { useDeepLinksSession } from "~Components/Providers/DeepLinksProvider"
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
    genesisId: string
    dappUrl?: string
}

type OnDappDisconnectedParams = {
    dappPublicKey: string
    genesisId: string
    redirectUrl: string
}

type OnSuccessParams = {
    redirectUrl: string
    data: object
    publicKey: string
}

export const useExternalDappConnection = () => {
    const signKeyPair = useAppSelector(selectSignKeyPair)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const { mutex } = useDeepLinksSession()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const externalDappSessions = useAppSelector(state => selectExternalDappSessions(state, selectedNetwork.genesis.id))

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
        async ({ dappPublicKey, redirectUrl, dappName, dappUrl, genesisId }: OnConnectParams) => {
            if (!dappPublicKey || !selectedAccount || !signKeyPair) {
                DAppUtils.dispatchInternalError(redirectUrl)
                mutex.release()
                return
            }

            try {
                const keyPair = nacl.box.keyPair()
                const sharedSecret = nacl.box.before(decodeBase64(dappPublicKey), keyPair.secretKey)

                const sessionData = JSON.stringify({
                    app_id: dappName,
                    genesisId: genesisId,
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
                        genesisId: genesisId,
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

                mutex.release()
                Linking.openURL(`${redirectUrl}?${params.toString()}`)
            } catch (_err: unknown) {
                const err = new DeepLinkError(DeepLinkErrorCode.InternalError)

                error("EXTERNAL_DAPP_CONNECTION", err)

                const params = new URLSearchParams({
                    errorMessage: err.message,
                    errorCode: err.code.toString(),
                })
                mutex.release()
                await Linking.openURL(`${redirectUrl}?${params.toString()}`)
            }
        },
        [dispatch, selectedAccount, signKeyPair, mutex],
    )

    const onDappDisconnected = useCallback(
        async ({ dappPublicKey, genesisId, redirectUrl }: OnDappDisconnectedParams) => {
            try {
                dispatch(deleteExternalDappSession({ appPublicKey: dappPublicKey, genesisId }))
                mutex.release()
                Linking.openURL(`${redirectUrl}`)
            } catch (e) {
                const err = new DeepLinkError(DeepLinkErrorCode.InternalError)
                error("EXTERNAL_DAPP_CONNECTION", err)
                const params = new URLSearchParams({
                    errorMessage: err.message,
                    errorCode: err.code.toString(),
                })
                mutex.release()
                Linking.openURL(`${redirectUrl}?${params.toString()}`)
            }
        },
        [dispatch, mutex],
    )

    const getSessionKeyPair = useCallback(
        (publicKey: string) => {
            const session = externalDappSessions[publicKey]

            if (!session) {
                throw new DeepLinkError(DeepLinkErrorCode.Unauthorized)
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
            try {
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
                    public_key: sessionKeyPair.publicKey,
                })
                mutex.release()
                await Linking.openURL(`${redirectUrl}?${params.toString()}`)
            } catch (e) {
                mutex.release()
                if (e instanceof DeepLinkError) {
                    const params = new URLSearchParams({
                        errorMessage: e.message,
                        errorCode: e.code.toString(),
                    })
                    await Linking.openURL(`${redirectUrl}?${params.toString()}`)
                    return
                }
                const err = new DeepLinkError(DeepLinkErrorCode.InternalError)

                error("EXTERNAL_DAPP_CONNECTION", err)

                const params = new URLSearchParams({
                    errorMessage: err.message,
                    errorCode: err.code.toString(),
                })
                await Linking.openURL(`${redirectUrl}?${params.toString()}`)
            }
        },
        [getSessionKeyPair, mutex],
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

            mutex.release()
            await Linking.openURL(`${redirectUrl}?${params.toString()}`)
        },
        [mutex],
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
            mutex.release()
            await Linking.openURL(`${redirectUrl}?${params.toString()}`)
        },
        [mutex],
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
