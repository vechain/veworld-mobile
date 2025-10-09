import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { AlertCard, BaseSpacer, BaseView, HeaderStyleV2, HeaderTitle, Layout, useNotifications } from "~Components"
import { isSmallScreen } from "~Constants"
import { useCheckWalletBackup, useClaimableUsernames, useThemedStyles } from "~Hooks"
import { TranslationFunctions, useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectAreDevFeaturesEnabled, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
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

type SettingsItem = SettingsRowItem | DividerItem | BackupBannerItem

export const SettingsScreen = () => {
    const { LL } = useI18nContext()
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const { featureEnabled: notificationFeatureEnabled } = useNotifications()

    const { unclaimedAddresses } = useClaimableUsernames()
    const { styles: themedStyles } = useThemedStyles(baseStyles)

    const flatSettingListRef = useRef(null)

    useScrollToTop(flatSettingListRef)

    const shouldShowBadge = useCallback(
        (item: SettingsRowItem) => {
            if (item.screenName === Routes.WALLET_MANAGEMENT) {
                return Boolean(unclaimedAddresses.length > 0)
            }

            return false
        },
        [unclaimedAddresses],
    )

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isShowBackupModal = useCheckWalletBackup(selectedAccount)

    const { settingsList } = useMemo(
        () =>
            getLists(
                LL,
                devFeaturesEnabled,
                notificationFeatureEnabled,
                AccountUtils.isObservedAccount(selectedAccount),
            ),
        [LL, devFeaturesEnabled, notificationFeatureEnabled, selectedAccount],
    )

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
        (props: { item: SettingsItem }) => {
            const { item } = props

            switch (item.element) {
                case "settingsRow":
                    return (
                        <SettingsRow
                            title={item.title}
                            screenName={item.screenName}
                            icon={item.icon}
                            url={item.url}
                            showBadge={shouldShowBadge(item)}
                        />
                    )

                case "divider":
                    return <SettingsRowDivider height={item.height} title={item.title} />

                case "backupBanner":
                    return isShowBackupModal ? renderBackupWarning : null

                default:
                    return null
            }
        },
        [isShowBackupModal, renderBackupWarning, shouldShowBadge],
    )

    return (
        <Layout
            noBackButton
            noMargin
            fixedHeader={
                <BaseView style={HeaderStyleV2} px={16}>
                    <HeaderTitle title={LL.TITLE_MORE_OPTIONS()} testID="settings-screen" />
                </BaseView>
            }
            body={
                <FlatList
                    ref={flatSettingListRef}
                    data={settingsList}
                    style={themedStyles.list}
                    scrollEnabled={isShowBackupModal || isSmallScreen}
                    keyExtractor={(item, index) =>
                        item.element === "settingsRow" ? item.icon : `${item.element}-${index}`
                    }
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        list: {
            paddingBottom: 28,
            paddingHorizontal: 24,
            paddingTop: 16,
        },
    })

const DIVIDER = {
    element: "divider",
    title: "Support_divider",
    height: 1,
} satisfies DividerItem

const BACKUP_BANNER = {
    element: "backupBanner",
    title: "Backup_Warning",
} satisfies BackupBannerItem

const getLists = (
    LL: TranslationFunctions,
    devEnabled: boolean,
    notificationFeatureEnabled: boolean,
    isObservedAccount: boolean,
): { settingsList: SettingsItem[] } => {
    const tiles = {
        GENERAL_SETTINGS: {
            element: "settingsRow",
            title: LL.TITLE_GENERAL_SETTINGS(),
            screenName: Routes.SETTINGS_GENERAL,
            icon: "icon-settings",
        },
        MANAGE_WALLET: {
            element: "settingsRow",
            title: LL.TITLE_MANAGE_WALLET(),
            screenName: Routes.WALLET_MANAGEMENT,
            icon: "icon-wallet",
        },
        NETWORKS: {
            element: "settingsRow",
            title: LL.TITLE_NETWORKS(),
            screenName: Routes.SETTINGS_NETWORK,
            icon: "icon-globe",
        },
        GET_SUPPORT: {
            element: "settingsRow",
            title: LL.TITLE_GET_SUPPORT(),
            screenName: Routes.BROWSER,
            icon: "icon-help-circle",
            url: "https://support.veworld.com",
        },
        GIVE_FEEDBACK: {
            element: "settingsRow",
            title: LL.TITLE_GIVE_FEEDBACK(),
            screenName: Routes.BROWSER,
            icon: "icon-message-square",
            url: "https://forms.office.com/e/Vq1CUJD9Vy",
        },
        ABOUT: {
            element: "settingsRow",
            title: LL.TITLE_ABOUT(),
            screenName: Routes.SETTINGS_ABOUT,
            icon: "icon-info",
        },
        TRANSACTIONS: {
            element: "settingsRow",
            title: LL.TITLE_TRANSACTIONS(),
            screenName: Routes.SETTINGS_TRANSACTIONS,
            icon: "icon-transaction",
        },
        CONNECTED_APPS: {
            element: "settingsRow",
            title: LL.TITLE_CONNECTED_APPS(),
            screenName: Routes.SETTINGS_CONNECTED_APPS,
            icon: "icon-apps",
        },
        CONTACTS: {
            element: "settingsRow",
            title: LL.TITLE_CONTACTS(),
            screenName: Routes.SETTINGS_CONTACTS,
            icon: "icon-users",
        },
        PRIVACY: {
            element: "settingsRow",
            title: LL.TITLE_PRIVACY(),
            screenName: Routes.SETTINGS_PRIVACY,
            icon: "icon-shield-check",
        },
        NOTIFICATIONS: {
            element: "settingsRow",
            title: LL.TITLE_NOTIFICATIONS(),
            screenName: Routes.SETTINGS_NOTIFICATIONS,
            icon: "icon-bell-ring",
        },
        ALERTS: {
            element: "settingsRow",
            title: LL.TITLE_ALERTS(),
            screenName: Routes.SETTINGS_ALERTS,
            icon: "icon-bell",
        },
    } satisfies Record<string, SettingsItem>

    if (isObservedAccount) {
        return {
            settingsList: [
                tiles.GENERAL_SETTINGS,
                tiles.MANAGE_WALLET,
                tiles.NETWORKS,
                DIVIDER,
                tiles.GET_SUPPORT,
                tiles.GIVE_FEEDBACK,
                tiles.ABOUT,
            ],
        }
    }
    const settingsList: SettingsItem[] = [
        tiles.GENERAL_SETTINGS,
        tiles.MANAGE_WALLET,
        tiles.TRANSACTIONS,
        tiles.NETWORKS,
        tiles.CONNECTED_APPS,
        tiles.CONTACTS,
        tiles.PRIVACY,
        BACKUP_BANNER,
        DIVIDER,
        tiles.GET_SUPPORT,
        tiles.GIVE_FEEDBACK,
        tiles.ABOUT,
    ]

    if (notificationFeatureEnabled) {
        settingsList.splice(4, 0, tiles.NOTIFICATIONS)
    }

    if (devEnabled) {
        settingsList.push(tiles.ALERTS)
    }

    return { settingsList }
}
