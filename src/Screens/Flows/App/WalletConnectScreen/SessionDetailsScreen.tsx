import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import {
    BaseButton,
    BaseView,
    BaseText,
    BackButtonHeader,
    BaseSafeArea,
    BaseSpacer,
    useWalletConnect,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"

type Props = NativeStackScreenProps<
    RootStackParamListHome,
    Routes.SETTINGS_CONNECTED_APP_DETAILS
>

export const SessionDetailsScreen = ({ route }: Props) => {
    const { session, account } = route.params

    const nav = useNavigation()
    const { disconnect } = useWalletConnect()

    const disconnectSession = useCallback(() => {
        disconnect(session.topic)
        nav.navigate(Routes.SETTINGS_CONNECTED_APPS)
    }, [session, disconnect, nav])

    return (
        <BaseSafeArea>
            <BackButtonHeader />

            <BaseView mx={20}>
                <BaseText typographyFont="title">{"Session Details"}</BaseText>
                <BaseSpacer height={24} />

                <BaseText>{session.peer.metadata.name}</BaseText>
                <BaseSpacer height={8} />
                <BaseText>{session.peer.metadata.url}</BaseText>
                <BaseSpacer height={8} />
                <BaseText>{session.peer.metadata.description}</BaseText>
                <BaseSpacer height={8} />
                <BaseText>{session.peer.metadata.icons[0]}</BaseText>
                <BaseSpacer height={8} />
                <BaseText>{session.peer.metadata.chainId}</BaseText>
                <BaseSpacer height={8} />

                <BaseText>
                    {"Selected account: "} {account.alias}
                </BaseText>
                <BaseText>
                    {"Address: "} {account.address}
                </BaseText>
            </BaseView>
            <BaseSpacer height={24} />
            <BaseView alignItems="center" justifyContent="center" mx={20}>
                <BaseButton action={disconnectSession} title="Disconnect" />
            </BaseView>
        </BaseSafeArea>
    )
}
