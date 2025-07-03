import React, { useCallback } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Text } from "react-native"
import { Routes } from "~Navigation"
import { RootStackParamListSwitch } from "~Navigation/Stacks/SwitchStack"
import { BaseButton, BaseSafeArea, BaseSpacer, BaseView } from "~Components"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECT_EXTERNAL_APP_SCREEN_V1>

export const ConnectExternalAppScreenV1 = ({ route }: Props) => {
    const { app_name, app_url, public_key, redirect_url, network } = route.params

    const { onConnect, onRejectConnection } = useExternalDappConnection()

    const handleConnect = useCallback(() => {
        if (!public_key || !redirect_url || !app_name) return

        onConnect({
            dappPublicKey: public_key,
            redirectUrl: redirect_url,
            dappName: app_name,
            dappUrl: app_url,
        })
    }, [onConnect, public_key, redirect_url, app_name, app_url])

    const handleReject = useCallback(() => {
        if (!redirect_url) return
        onRejectConnection(redirect_url)
    }, [onRejectConnection, redirect_url])

    return (
        <BaseSafeArea>
            <BaseView p={16}>
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
                    <BaseButton action={handleReject}>
                        <Text>{"Reject"}</Text>
                    </BaseButton>
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}
