import { useCallback, useEffect } from "react"
import { Linking } from "react-native"
import DeviceInfo from "react-native-device-info"
import nacl from "tweetnacl"
import { decodeBase64, encodeBase64 } from "tweetnacl-util"
import {
    selectSelectedAccount,
    useAppSelector,
    selectSignKeyPair,
    selectSelectedNetwork,
    useAppDispatch,
    newExternalDappSession,
    setSignKeyPair,
} from "~Storage/Redux"
import { error } from "~Utils"

type OnConnectParams = {
    dappPublicKey: string
    redirectUrl: string
    dappName: string
    dappUrl?: string
}

export const useExternalDappConnection = () => {
    const signKeyPair = useAppSelector(selectSignKeyPair)
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)

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
                const err = _err as Error
                error("EXTERNAL_DAPP_CONNECTION", err)
                await Linking.openURL(
                    `${redirectUrl}/onVeWorldConnected?errorMessage=${err.message}&errorCode=${err.name}`,
                )
            }
        },
        [dispatch, network.type, selectedAccount, signKeyPair],
    )

    const onRejectConnection = useCallback(async (redirectUrl: string) => {
        await Linking.openURL(
            `${redirectUrl}/onVeWorldConnected?errorMessage=${encodeURIComponent(
                "Connection rejected",
            )}&error_code=401`,
        )
    }, [])

    return {
        onConnect,
        getKeyPairFromPrivateKey,
        onRejectConnection,
    }
}
