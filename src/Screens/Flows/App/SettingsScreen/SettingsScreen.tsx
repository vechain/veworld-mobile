import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { AlertCard, BaseSpacer, BaseView, HeaderStyleV2, HeaderTitle, Layout, useNotifications } from "~Components"
import { isSmallScreen } from "~Constants"
import { useCheckWalletBackup, useClaimableUsernames, useThemedStyles } from "~Hooks"
import { TranslationFunctions, useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import {
    selectAreDevFeaturesEnabled,
    selectDeveloperMenuUnlocked,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { RowProps, SettingsRow } from "./Components/SettingsRow"
import SettingsRowDivider, { RowDividerProps } from "./Components/SettingsRowDivider"
import { useResetSettingStack } from "../ActivityScreen/Hooks"

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
    // Reset the setting stack when the current account or network changes
    useResetSettingStack()

    const { LL } = useI18nContext()
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)
    const developerMenuUnlocked = useAppSelector(selectDeveloperMenuUnlocked)

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
                developerMenuUnlocked,
                notificationFeatureEnabled,
                AccountUtils.isObservedAccount(selectedAccount),
            ),
        [LL, devFeaturesEnabled, developerMenuUnlocked, notificationFeatureEnabled, selectedAccount],
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
                    return <SettingsRow {...item} showBadge={shouldShowBadge(item)} />

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
                    <HeaderTitle
                        title={LL.TITLE_MORE_OPTIONS()}
                        testID="settings-screen"
                        typographyFont="headerTitle"
                        align="left"
                    />
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
    developerMenuUnlocked: boolean,
    notificationFeatureEnabled: boolean,
    isObservedAccount: boolean,
): { settingsList: SettingsItem[] } => {
    const tiles = {
        GENERAL_SETTINGS: {
            element: "settingsRow",
            title: LL.TITLE_GENERAL_SETTINGS(),
            screenName: Routes.SETTINGS_GENERAL,
            icon: "icon-settings",
            external: false,
        },
        MANAGE_WALLET: {
            element: "settingsRow",
            title: LL.TITLE_MANAGE_WALLET(),
            screenName: Routes.WALLET_MANAGEMENT,
            icon: "icon-wallet",
            external: false,
        },
        NETWORKS: {
            element: "settingsRow",
            title: LL.TITLE_NETWORKS(),
            screenName: Routes.SETTINGS_NETWORK,
            icon: "icon-globe",
            external: false,
        },
        GET_SUPPORT: {
            element: "settingsRow",
            title: LL.TITLE_GET_SUPPORT(),
            icon: "icon-help-circle",
            url: "https://support.veworld.com",
            external: true,
        },
        ABOUT: {
            element: "settingsRow",
            title: LL.TITLE_ABOUT(),
            screenName: Routes.SETTINGS_ABOUT,
            icon: "icon-info",
            external: false,
        },
        TRANSACTIONS: {
            element: "settingsRow",
            title: LL.TITLE_TRANSACTIONS(),
            screenName: Routes.SETTINGS_TRANSACTIONS,
            icon: "icon-transaction",
            external: false,
        },
        CONNECTED_APPS: {
            element: "settingsRow",
            title: LL.TITLE_CONNECTED_APPS(),
            screenName: Routes.SETTINGS_CONNECTED_APPS,
            icon: "icon-apps",
            external: false,
        },
        CONTACTS: {
            element: "settingsRow",
            title: LL.TITLE_CONTACTS(),
            screenName: Routes.SETTINGS_CONTACTS,
            icon: "icon-users",
            external: false,
        },
        PRIVACY: {
            element: "settingsRow",
            title: LL.TITLE_PRIVACY(),
            screenName: Routes.SETTINGS_PRIVACY,
            icon: "icon-shield-check",
            external: false,
        },
        NOTIFICATIONS: {
            element: "settingsRow",
            title: LL.TITLE_NOTIFICATIONS(),
            screenName: Routes.SETTINGS_NOTIFICATIONS,
            icon: "icon-bell-ring",
            external: false,
        },
        ALERTS: {
            element: "settingsRow",
            title: LL.TITLE_ALERTS(),
            screenName: Routes.SETTINGS_ALERTS,
            icon: "icon-bell",
            external: false,
        },
        DEVELOPER: {
            element: "settingsRow",
            title: LL.TITLE_DEVELOPER_SETTINGS(),
            screenName: Routes.SETTINGS_DEVELOPER,
            icon: "icon-code",
            external: false,
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
        tiles.ABOUT,
    ]

    if (notificationFeatureEnabled) {
        settingsList.splice(4, 0, tiles.NOTIFICATIONS)
    }

    if (devEnabled) {
        settingsList.push(tiles.ALERTS)
    }

    if (developerMenuUnlocked) {
        settingsList.push(tiles.DEVELOPER)
    }

    return { settingsList }
}
