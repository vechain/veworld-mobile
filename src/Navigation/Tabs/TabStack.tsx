import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigatorScreenParams } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { TabIcon, useFeatureFlags } from "~Components"
import { useCheckWalletBackup, useTheme } from "~Hooks"
import { IconKey } from "~Model"
import { Routes } from "~Navigation/Enums"
import {
    DiscoverStack,
    HomeStack,
    RootStackParamListBrowser,
    RootStackParamListHome,
    RootStackParamListSettings,
    SettingsStack,
} from "~Navigation/Stacks"
import { AppsStack, RootStackParamListApps } from "~Navigation/Stacks/AppsStack"
import { HistoryStack, HistoryStackParamList } from "~Navigation/Stacks/HistoryStack"
import { NFTStack, RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { selectCurrentScreen, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import PlatformUtils from "~Utils/PlatformUtils"
import { useI18nContext } from "~i18n"

export type TabStackParamList = {
    HomeStack: NavigatorScreenParams<RootStackParamListHome>
    NFTStack: NavigatorScreenParams<RootStackParamListNFT>
    DiscoverStack: NavigatorScreenParams<RootStackParamListBrowser>
    SettingsStack: NavigatorScreenParams<RootStackParamListSettings>
    [Routes.HISTORY_STACK]: NavigatorScreenParams<HistoryStackParamList>
    AppsStack: NavigatorScreenParams<RootStackParamListApps>
}

const Tab = createBottomTabNavigator<TabStackParamList>()

export const TabStack = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const currentScreen = useAppSelector(selectCurrentScreen)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isShowBackupModal = useCheckWalletBackup(selectedAccount)

    const { betterWorldFeature } = useFeatureFlags()

    const renderTabBarIcon = useCallback(
        (focused: boolean, iconName: IconKey, label: string) => {
            const isSettings = iconName === "icon-menu"

            return (
                <TabIcon
                    focused={focused}
                    title={iconName}
                    isSettings={isSettings}
                    isShowBackupModal={isShowBackupModal}
                    label={label}
                />
            )
        },
        [isShowBackupModal],
    )

    const display = useMemo(() => {
        switch (currentScreen) {
            case Routes.SETTINGS_GET_SUPPORT:
            case Routes.SETTINGS_GIVE_FEEDBACK:
            case Routes.BROWSER:
            case Routes.TOKEN_DETAILS:
            case Routes.DISCOVER_TABS_MANAGER:
            case Routes.APPS_TABS_MANAGER:
            case Routes.APPS_SEARCH:
            case Routes.DISCOVER_SEARCH:
            case Routes.BUY_WEBVIEW:
                return "none"

            case "":
                return "none"

            default:
                return "flex"
        }
    }, [currentScreen])

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    display,
                    backgroundColor: theme.colors.card,
                    ...tabbarBaseStyles.tabbar,
                    ...tabbarBaseStyles.shadow,
                },
            }}>
            <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={{
                    tabBarLabel: "Wallet",
                    tabBarTestID: "wallet-tab",
                    tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-home", LL.TAB_TITLE_HOME()),
                }}
            />

            {!betterWorldFeature?.balanceScreen?.collectibles?.enabled && (
                <Tab.Screen
                    name="NFTStack"
                    component={NFTStack}
                    options={{
                        tabBarLabel: "NFT",
                        tabBarTestID: "nft-tab",
                        tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-image", LL.TAB_TITLE_NFT()),
                    }}
                />
            )}

            {!AccountUtils.isObservedAccount(selectedAccount) &&
                (betterWorldFeature?.appsScreen?.enabled ? (
                    <Tab.Screen
                        name="AppsStack"
                        component={AppsStack}
                        options={{
                            tabBarLabel: "Apps",
                            tabBarTestID: "apps-tab",
                            tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-apps", LL.TAB_TITLE_APPS()),
                        }}
                    />
                ) : (
                    <Tab.Screen
                        name="DiscoverStack"
                        component={DiscoverStack}
                        options={{
                            tabBarLabel: "Discover",
                            tabBarTestID: "discover-tab",
                            tabBarIcon: ({ focused }) =>
                                renderTabBarIcon(focused, "icon-explorer", LL.TAB_TITLE_DISCOVER()),
                        }}
                    />
                ))}

            <Tab.Screen
                name={Routes.HISTORY_STACK}
                component={HistoryStack}
                options={{
                    tabBarLabel: Routes.HISTORY,
                    tabBarTestID: "history-tab",
                    tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-history", LL.TAB_TITLE_ACTIVITY()),
                }}
            />

            <Tab.Screen
                name="SettingsStack"
                component={SettingsStack}
                options={{
                    tabBarLabel: "Settings",
                    tabBarTestID: "settings-tab",
                    tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-more-horizontal", LL.TAB_TITLE_MORE()),
                }}
            />
        </Tab.Navigator>
    )
}

export const tabbarBaseStyles = StyleSheet.create({
    tabbar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 0,
        paddingVertical: 8,
        paddingHorizontal: 16,
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        height: PlatformUtils.isIOS() ? 90 : 56,
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
})
