import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import { useTheme } from "~Hooks"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { RootStackParamListSettings, Routes } from "~Navigation"

type Excluded = Routes.WALLET_DETAILS | Routes.ICLOUD_MNEMONIC_BACKUP | Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD

type ExcludedSettingRoutes = Excluded | Routes.SETTINGS_GET_SUPPORT | Routes.SETTINGS_GIVE_FEEDBACK

export type RowProps = {
    title: LocalizedString
    screenName: keyof Omit<RootStackParamListSettings, Excluded>
    icon: string
    url?: string
}

export const SettingsRow = ({ title, screenName, icon, url }: RowProps) => {
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

            <BaseIcon color={theme.colors.text} name={"chevron-right"} size={24} />
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
})
