import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigatorScreenParams } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { TabIcon } from "~Components"
import { useCheckWalletBackup, useTheme } from "~Hooks"
import { NETWORK_TYPE } from "~Model"
import { Routes } from "~Navigation/Enums"
import {
    DiscoverStack,
    HomeStack,
    RootStackParamListBrowser,
    RootStackParamListHome,
    RootStackParamListSettings,
    SettingsStack,
} from "~Navigation/Stacks"
import { HistoryStack, HistoryStackParamList } from "~Navigation/Stacks/HistoryStack"
import { NFTStack, RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { selectCurrentScreen, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import PlatformUtils from "~Utils/PlatformUtils"

export type TabStackParamList = {
    HomeStack: NavigatorScreenParams<RootStackParamListHome>
    NFTStack: NavigatorScreenParams<RootStackParamListNFT>
    DiscoverStack: NavigatorScreenParams<RootStackParamListBrowser>
    SettingsStack: NavigatorScreenParams<RootStackParamListSettings>
    [Routes.HISTORY_STACK]: NavigatorScreenParams<HistoryStackParamList>
}

const Tab = createBottomTabNavigator<TabStackParamList>()

export const TabStack = () => {
    const theme = useTheme()
    const currentScreen = useAppSelector(selectCurrentScreen)
    const network = useAppSelector(selectSelectedNetwork)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isShowBackupModal = useCheckWalletBackup(selectedAccount)

    const renderTabBarIcon = useCallback(
        (focused: boolean, iconName: string) => {
            const isSettings = iconName === "menu"

            return (
                <TabIcon
                    focused={focused}
                    title={iconName}
                    isSettings={isSettings}
                    isShowBackupModal={isShowBackupModal}
                />
            )
        },
        [isShowBackupModal],
    )

    const display = useMemo(() => {
        switch (currentScreen) {
            case Routes.BROWSER:
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
                    backgroundColor:
                        network.name === NETWORK_TYPE.MAIN ? theme.colors.card : theme.colors.testnetBackground,
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
                    tabBarIcon: ({ focused }) => renderTabBarIcon(focused, focused ? "home" : "home-outline"),
                }}
            />

            <Tab.Screen
                name="NFTStack"
                component={NFTStack}
                options={{
                    tabBarLabel: "NFT",
                    tabBarTestID: "nft-tab",
                    tabBarIcon: ({ focused }) =>
                        renderTabBarIcon(focused, focused ? "image-multiple" : "image-multiple-outline"),
                }}
            />

            <Tab.Screen
                name="DiscoverStack"
                component={DiscoverStack}
                options={{
                    tabBarLabel: "Discover",
                    tabBarTestID: "discover-tab",
                    tabBarIcon: ({ focused }) => renderTabBarIcon(focused, focused ? "compass" : "compass-outline"),
                }}
            />

            <Tab.Screen
                name={Routes.HISTORY_STACK}
                component={HistoryStack}
                options={{
                    tabBarLabel: Routes.HISTORY,
                    tabBarTestID: "history-tab",
                    tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "history"),
                }}
            />

            <Tab.Screen
                name="SettingsStack"
                component={SettingsStack}
                options={{
                    tabBarLabel: "Settings",
                    tabBarTestID: "settings-tab",
                    tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "menu"),
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: PlatformUtils.isIOS() ? 86 : 68,
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
