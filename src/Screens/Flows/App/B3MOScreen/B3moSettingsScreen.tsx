import { CommonActions, useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { Alert } from "react-native"
import { BaseButton, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { clearB3moLink, resetB3moSessionState, selectAccounts, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectB3moLinkedAddress } from "~Storage/Redux/Selectors/B3mo"
import { AddressUtils } from "~Utils"

export const B3moSettingsScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const linkedAddress = useAppSelector(selectB3moLinkedAddress)
    const accounts = useAppSelector(selectAccounts)
    const account = linkedAddress
        ? accounts.find(a => a.address.toLowerCase() === linkedAddress.toLowerCase())
        : undefined

    const onSwitchWallet = useCallback(() => {
        dispatch(resetB3moSessionState())
        dispatch(clearB3moLink())
        nav.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: Routes.B3MO_ONBOARDING_WALLET_CHOICE }],
            }),
        )
    }, [dispatch, nav])

    const onReset = useCallback(() => {
        Alert.alert(LL.B3MO_AGENT_SETTINGS_RESET(), LL.B3MO_AGENT_SETTINGS_RESET_CONFIRM(), [
            { text: "Cancel", style: "cancel" },
            {
                text: LL.B3MO_AGENT_SETTINGS_RESET(),
                style: "destructive",
                onPress: () => {
                    dispatch(resetB3moSessionState())
                    dispatch(clearB3moLink())
                    nav.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: Routes.B3MO_ONBOARDING_INTRO }],
                        }),
                    )
                },
            },
        ])
    }, [dispatch, nav, LL])

    return (
        <Layout
            title={LL.B3MO_AGENT_SETTINGS_TITLE()}
            body={
                <BaseView pt={16}>
                    <BaseText typographyFont="bodyBold">{LL.B3MO_AGENT_SETTINGS_LINKED_WALLET()}</BaseText>
                    <BaseSpacer height={4} />
                    <BaseText typographyFont="captionMedium" color={theme.colors.subtitle}>
                        {account?.alias ?? "—"}
                        {linkedAddress ? ` (${AddressUtils.humanAddress(linkedAddress, 6, 6)})` : ""}
                    </BaseText>
                </BaseView>
            }
            footer={
                <BaseView>
                    <BaseButton
                        variant="outline"
                        title={LL.B3MO_AGENT_SETTINGS_SWITCH_WALLET()}
                        action={onSwitchWallet}
                        testID="b3mo-switch-wallet"
                    />
                    <BaseSpacer height={12} />
                    <BaseButton
                        variant="ghost"
                        title={LL.B3MO_AGENT_SETTINGS_RESET()}
                        action={onReset}
                        testID="b3mo-reset"
                    />
                </BaseView>
            }
        />
    )
}
