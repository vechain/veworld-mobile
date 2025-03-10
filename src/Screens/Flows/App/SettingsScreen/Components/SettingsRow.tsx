import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import { useTheme } from "~Hooks"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { IconKey } from "~Model"

type Excluded =
    | Routes.WALLET_DETAILS
    | Routes.ICLOUD_DETAILS_BACKUP
    | Routes.CHOOSE_DETAILS_BACKUP_PASSWORD
    | Routes.CLAIM_USERNAME
    | Routes.USERNAME_CLAIMED

type ExcludedSettingRoutes = Excluded | Routes.SETTINGS_GET_SUPPORT | Routes.SETTINGS_GIVE_FEEDBACK

export type RowProps = {
    title: LocalizedString
    screenName: keyof Omit<RootStackParamListSettings, Excluded>
    icon: IconKey
    showBadge?: boolean
    url?: string
}

export const SettingsRow = ({ title, screenName, icon, url, showBadge }: RowProps) => {
    const nav = useNavigation()

    const theme = useTheme()

    const onPress = useCallback(() => {
        if (url && (screenName === Routes.SETTINGS_GET_SUPPORT || screenName === Routes.SETTINGS_GIVE_FEEDBACK)) {
            nav.navigate(screenName, { url })
            return
        }

        nav.navigate(screenName as keyof Omit<RootStackParamListSettings, ExcludedSettingRoutes>)
    }, [url, screenName, nav])

    return (
        <BaseTouchable action={onPress} style={baseStyles.container} haptics="Light" testID={title}>
            <BaseView flexDirection="row">
                <BaseIcon color={theme.colors.text} name={icon} size={24} />
                <BaseText mx={14} typographyFont="button" color={theme.colors.text}>
                    {title}
                </BaseText>
            </BaseView>
            <BaseView flexDirection="row" style={baseStyles.actionContainer}>
                {showBadge && <BaseView p={2} bg={theme.colors.errorVariant.icon} borderRadius={4} />}
                <BaseIcon color={theme.colors.text} name={"icon-chevron-right"} size={16} />
            </BaseView>
        </BaseTouchable>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    actionContainer: {
        gap: 12,
    },
})
