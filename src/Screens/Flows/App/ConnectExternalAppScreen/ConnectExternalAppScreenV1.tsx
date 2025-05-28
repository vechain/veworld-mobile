import React, { useEffect } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Linking, NativeModules, Text } from "react-native"
import { Routes } from "~Navigation"
import { RootStackParamListSwitch } from "~Navigation/Stacks/SwitchStack"
import { BaseButton, BaseSafeArea, BaseSpacer, BaseView } from "~Components"
import { TestHelpers } from "~Test"
import DeviceInfo from "react-native-device-info"

const { vetTransaction1 } = TestHelpers.data

const { CryptoKitManager } = NativeModules

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECT_EXTERNAL_APP_SCREEN_V1>

export const ConnectExternalAppScreenV1 = ({ route }: Props) => {
    const { app_name, app_url, public_key, redirect_url, network } = route.params

    useEffect(() => {
        const init = async () => {
            const keyPair = await CryptoKitManager.generateKeyPair()
            // console.log("keyPair", keyPair)
            const keyPair2 = await CryptoKitManager.generateKeyPair()
            // console.log("keyPair2", keyPair2)

            const sharedSecret = await CryptoKitManager.deriveSharedSecret(keyPair.privateKey, keyPair2.publicKey)
            const sharedSecret2 = await CryptoKitManager.deriveSharedSecret(keyPair2.privateKey, keyPair.publicKey)
            // console.log("sharedSecret", sharedSecret)
            // console.log("sharedSecret2", sharedSecret2)

            // console.log("symmetricKey", sharedSecret.sharedSecret === sharedSecret2.sharedSecret)

            // console.log("sharedSecret.sharedSecret", sharedSecret.sharedSecret.length)

            try {
                const { encrypted, nonce } = await CryptoKitManager.encrypt(
                    JSON.stringify(vetTransaction1),
                    sharedSecret.sharedSecret,
                )
                // console.log("encrypted", encrypted)
                // console.log("nonce", nonce)

                await CryptoKitManager.decrypt(encrypted, sharedSecret2.sharedSecret, nonce)
                // console.log("decrypted", decrypted)
            } catch (error) {
                // console.log(error)
            }
        }
        init()
    }, [])

    const handleConnect = async () => {
        const keyPair = await CryptoKitManager.generateKeyPair()

        const sharedSecret = await CryptoKitManager.deriveSharedSecret(keyPair.privateKey, public_key)

        const sessionData = JSON.stringify({
            app_id: DeviceInfo.getBundleId(),
            network: network,
            timestamp: new Date().getTime(),
        })

        const response = JSON.stringify({
            public_key: keyPair.publicKey,
            session: btoa(sessionData),
        })

        const { encrypted, nonce } = await CryptoKitManager.encrypt(response, sharedSecret.sharedSecret)
        // console.log("PUBLIC KEY", keyPair.publicKey, Buffer.from(keyPair.publicKey, "base64").length)
        // console.log("NONCE", nonce, Buffer.from(nonce, "base64").length)
        // console.log("SHARDED", sharedSecret.sharedSecret, Buffer.from(sharedSecret.sharedSecret, "base64").length)

        await Linking.openURL(
            `${redirect_url}onVeWorldConnected?public_key=${encodeURIComponent(
                keyPair.publicKey,
            )}&data=${encodeURIComponent(btoa(encrypted))}&nonce=${encodeURIComponent(nonce)}`,
        )
    }

    return (
        <BaseSafeArea>
            <Text>{"Connect External App"}</Text>
            <BaseSpacer height={10} />
            <BaseView gap={10}>
                <Text>{"appName: " + app_name}</Text>
                <Text>{"appUrl: " + app_url}</Text>
                <Text>{"publicKey: " + public_key}</Text>
                <Text>{"redirectUrl: " + redirect_url}</Text>
                <Text>{"network: " + network}</Text>

                <BaseButton action={handleConnect}>
                    <Text>{"Connect"}</Text>
                </BaseButton>
            </BaseView>
        </BaseSafeArea>
    )
}
