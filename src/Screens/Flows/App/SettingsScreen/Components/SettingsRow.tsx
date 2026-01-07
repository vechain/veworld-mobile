import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { Linking, StyleSheet } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useDynamicOfflineCallback } from "~Hooks/useOfflineCallback"
import { IconKey } from "~Model"
import { RootStackParamListSettings, Routes } from "~Navigation"

type Excluded =
    | Routes.WALLET_DETAILS
    | Routes.ICLOUD_DETAILS_BACKUP
    | Routes.CHOOSE_DETAILS_BACKUP_PASSWORD
    | Routes.CLAIM_USERNAME
    | Routes.USERNAME_CLAIMED

type ExcludedSettingRoutes = Excluded | Routes.BROWSER

export type RowProps =
    | {
          title: LocalizedString
          screenName: keyof Omit<RootStackParamListSettings, Excluded> | Routes.BROWSER
          icon: IconKey
          showBadge?: boolean
          url?: string
          external: false
      }
    | {
          title: LocalizedString
          icon: IconKey
          screenName?: undefined
          showBadge?: boolean
          url: string
          external: true
      }

export const SettingsRow = ({ title, icon, url, showBadge, external, screenName }: RowProps) => {
    const nav = useNavigation()
    const { navigateWithTab } = useBrowserTab()

    const theme = useTheme()

    const executeOffline = useDynamicOfflineCallback()

    const onPress = useCallback(async () => {
        if (external && (await Linking.canOpenURL(url))) {
            await executeOffline(() => Linking.openURL(url))
            return
        }

        if (url && screenName === Routes.BROWSER) {
            executeOffline(() =>
                navigateWithTab({
                    url,
                    title,
                    navigationFn(u) {
                        nav.navigate(Routes.BROWSER, { url: u, returnScreen: Routes.SETTINGS })
                    },
                }),
            )

            return
        }

        nav.navigate(screenName as keyof Omit<RootStackParamListSettings, ExcludedSettingRoutes>)
    }, [external, url, screenName, nav, executeOffline, navigateWithTab, title])

    const textColor = useMemo(() => {
        return theme.isDark ? COLORS.GREY_300 : COLORS.PURPLE
    }, [theme.isDark])

    return (
        <BaseTouchable action={onPress} style={baseStyles.container} haptics="Light" testID={title}>
            <BaseView flexDirection="row">
                <BaseIcon color={textColor} name={icon} size={24} />
                <BaseText mx={14} typographyFont="subSubTitleMedium" color={textColor}>
                    {title}
                </BaseText>
            </BaseView>
            <BaseView flexDirection="row" style={baseStyles.actionContainer}>
                {showBadge && <BaseView p={2} bg={theme.colors.errorVariant.icon} borderRadius={4} />}
                <BaseIcon color={textColor} name={"icon-chevron-right"} size={16} />
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
