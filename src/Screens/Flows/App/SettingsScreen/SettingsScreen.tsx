import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { AlertCard, BaseSpacer, BaseText, BaseView, Layout, SelectedNetworkViewer } from "~Components"
import { ColorThemeType, isSmallScreen } from "~Constants"
import { useCheckWalletBackup, useTabBarBottomMargin, useThemedStyles } from "~Hooks"
import { TranslationFunctions, useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectAreDevFeaturesEnabled, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { RowProps, SettingsRow } from "./Components/SettingsRow"
import SettingsRowDivider, { RowDividerProps } from "./Components/SettingsRowDivider"

type SettingsRowItem = {
    element: "settingsRow"
} & RowProps

type DividerItem = {
    element: "divider"
} & RowDividerProps

type BackupBannerItem = {
    element: "backupBanner"
    title: string
}

export const SettingsScreen = () => {
    const { LL } = useI18nContext()
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const { settingsList } = useMemo(() => getLists(LL, devFeaturesEnabled), [devFeaturesEnabled, LL])

    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const { androidOnlyTabBarBottomMargin } = useTabBarBottomMargin()

    const flatSettingListRef = useRef(null)

    useScrollToTop(flatSettingListRef)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isShowBackupModal = useCheckWalletBackup(selectedAccount)

    const renderBackupWarning = useMemo(() => {
        return (
            <>
                <AlertCard
                    title={LL.ALERT_TITLE_BACKUP_YOUR_WALLET()}
                    message={LL.ALERT_MSG_BACKUP_YOUR_WALLET()}
                    status={"error"}
                />
                <BaseSpacer height={8} />
            </>
        )
    }, [LL])

    const renderItem = useCallback(
        (props: { item: SettingsRowItem | DividerItem | BackupBannerItem }) => {
            const { item } = props

            switch (item.element) {
                case "settingsRow":
                    return (
                        <SettingsRow title={item.title} screenName={item.screenName} icon={item.icon} url={item.url} />
                    )

                case "divider":
                    return <SettingsRowDivider height={item.height} title={item.title} />

                case "backupBanner":
                    return isShowBackupModal ? renderBackupWarning : null

                default:
                    return null
            }
        },
        [isShowBackupModal, renderBackupWarning],
    )

    return (
        <Layout
            noBackButton
            fixedHeader={
                <BaseView flexDirection="row" justifyContent="space-between" py={4}>
                    <BaseText typographyFont="subSubTitleSemiBold" testID="settings-screen">
                        {LL.TITLE_MENU()}
                    </BaseText>
                    <SelectedNetworkViewer />
                </BaseView>
            }
            body={
                <BaseView mt={-8} style={[themedStyles.list, { paddingBottom: androidOnlyTabBarBottomMargin }]}>
                    <FlatList
                        ref={flatSettingListRef}
                        data={settingsList}
                        scrollEnabled={isShowBackupModal || isSmallScreen}
                        keyExtractor={(item, index) =>
                            item.element === "settingsRow" ? item.screenName : `${item.element}-${index}`
                        }
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        renderItem={renderItem}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        separator: {
            backgroundColor: theme.colors.text,
            height: 0.5,
        },
        list: {
            paddingTop: 0,
            paddingHorizontal: 8,
            flex: 1,
        },
    })

const getLists = (LL: TranslationFunctions, devEnabled: boolean) => {
    const settingsList: (SettingsRowItem | DividerItem | BackupBannerItem)[] = [
        {
            element: "settingsRow",
            title: LL.TITLE_GENERAL_SETTINGS(),
            screenName: Routes.SETTINGS_GENERAL,
            icon: "icon-settings",
        },
        {
            element: "settingsRow",
            title: LL.TITLE_MANAGE_WALLET(),
            screenName: Routes.WALLET_MANAGEMENT,
            icon: "icon-wallet",
        },
        {
            element: "settingsRow",
            title: LL.TITLE_TRANSACTIONS(),
            screenName: Routes.SETTINGS_TRANSACTIONS,
            icon: "icon-transaction",
        },
        {
            element: "settingsRow",
            title: LL.TITLE_NETWORKS(),
            screenName: Routes.SETTINGS_NETWORK,
            icon: "icon-globe",
        },
        {
            element: "settingsRow",
            title: LL.TITLE_CONNECTED_APPS(),
            screenName: Routes.SETTINGS_CONNECTED_APPS,
            icon: "icon-apps",
        },
        {
            element: "settingsRow",
            title: LL.TITLE_CONTACTS(),
            screenName: Routes.SETTINGS_CONTACTS,
            icon: "icon-users",
        },
        {
            element: "settingsRow",
            title: LL.TITLE_PRIVACY(),
            screenName: Routes.SETTINGS_PRIVACY,
            icon: "icon-shield-check",
        },
        {
            element: "backupBanner",
            title: "Backup_Warning",
        },
        {
            element: "divider",
            title: "Support_divider",
            height: 1,
        },
        {
            element: "settingsRow",
            title: LL.TITLE_GET_SUPPORT(),
            screenName: Routes.SETTINGS_GET_SUPPORT,
            icon: "icon-help-circle",
            url: "https://support.veworld.com",
        },
        {
            element: "settingsRow",
            title: LL.TITLE_GIVE_FEEDBACK(),
            screenName: Routes.SETTINGS_GIVE_FEEDBACK,
            icon: "icon-message-square",
            url: "https://forms.office.com/e/Vq1CUJD9Vy",
        },
        {
            element: "settingsRow",
            title: LL.TITLE_ABOUT(),
            screenName: Routes.SETTINGS_ABOUT,
            icon: "icon-info",
        },
    ]

    if (devEnabled) {
        settingsList.push({
            element: "settingsRow",
            title: LL.TITLE_ALERTS(),
            screenName: Routes.SETTINGS_ALERTS,
            icon: "icon-bell",
        })
    }

    return { settingsList }
}
