import { CommonActions, useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { Alert, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView, Layout } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import {
    clearB3moLink,
    resetB3moSessionState,
    selectAccounts,
    setB3moExecutionMode,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { selectB3moExecutionMode, selectB3moLinkedAddress } from "~Storage/Redux/Selectors/B3mo"
import type { B3moExecutionMode } from "~Storage/Redux/Slices/B3mo"
import { AddressUtils } from "~Utils"

type ModeOptionProps = {
    title: string
    description: string
    selected: boolean
    onPress: () => void
    testID: string
}

const ModeOption = ({ title, description, selected, onPress, testID }: ModeOptionProps) => {
    const { styles, theme } = useThemedStyles(modeOptionStyles)
    return (
        <BaseTouchable action={onPress} testID={testID}>
            <BaseView style={[styles.card, selected && styles.cardSelected]}>
                <BaseView flexDirection="row" alignItems="center">
                    <BaseText typographyFont="bodyBold" flex={1}>
                        {title}
                    </BaseText>
                    <BaseIcon
                        name={selected ? "icon-radio-selected" : "icon-radio-default"}
                        color={selected ? theme.colors.primary : theme.colors.subtitle}
                        size={18}
                    />
                </BaseView>
                <BaseSpacer height={4} />
                <BaseText typographyFont="captionRegular" color={theme.colors.subtitle}>
                    {description}
                </BaseText>
            </BaseView>
        </BaseTouchable>
    )
}

export const B3moSettingsScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)
    const dispatch = useAppDispatch()
    const linkedAddress = useAppSelector(selectB3moLinkedAddress)
    const executionMode = useAppSelector(selectB3moExecutionMode)
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

    const onSelectMode = useCallback(
        (mode: B3moExecutionMode) => {
            dispatch(setB3moExecutionMode({ mode }))
        },
        [dispatch],
    )

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

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="bodyBold">{LL.B3MO_AGENT_SETTINGS_EXEC_MODE_TITLE()}</BaseText>
                    <BaseSpacer height={8} />
                    <BaseView style={styles.modeList}>
                        <ModeOption
                            title={LL.B3MO_AGENT_EXEC_MODE_CONFIRM()}
                            description={LL.B3MO_AGENT_EXEC_MODE_CONFIRM_DESC()}
                            selected={executionMode === "confirm"}
                            onPress={() => onSelectMode("confirm")}
                            testID="b3mo-exec-mode-confirm"
                        />
                        <ModeOption
                            title={LL.B3MO_AGENT_EXEC_MODE_AUTO()}
                            description={LL.B3MO_AGENT_EXEC_MODE_AUTO_DESC()}
                            selected={executionMode === "auto"}
                            onPress={() => onSelectMode("auto")}
                            testID="b3mo-exec-mode-auto"
                        />
                    </BaseView>
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

const baseStyles = () =>
    StyleSheet.create({
        modeList: {
            gap: 8,
        },
    })

const modeOptionStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
            padding: 12,
        },
        cardSelected: {
            borderColor: theme.colors.primary,
            borderWidth: 1,
        },
    })
