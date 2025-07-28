import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigatorScreenParams } from "@react-navigation/native"
import React, { useCallback, useMemo, createContext, useContext, useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { TabIcon } from "~Components"
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
import { HistoryStack, HistoryStackParamList } from "~Navigation/Stacks/HistoryStack"
import { NFTStack, RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { selectCurrentScreen, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import PlatformUtils from "~Utils/PlatformUtils"
import { COLORS } from "~Constants"

export type TabStackParamList = {
    HomeStack: NavigatorScreenParams<RootStackParamListHome>
    NFTStack: NavigatorScreenParams<RootStackParamListNFT>
    DiscoverStack: NavigatorScreenParams<RootStackParamListBrowser>
    SettingsStack: NavigatorScreenParams<RootStackParamListSettings>
    [Routes.HISTORY_STACK]: NavigatorScreenParams<HistoryStackParamList>
}

const Tab = createBottomTabNavigator<TabStackParamList>()

const FocusedTabContext = createContext<string>("HomeStack")

const CustomTabButton = (props: any) => {
    const { children, onPress, route, ...otherProps } = props
    const focusedTab = useContext(FocusedTabContext)

    const routeName = route?.name || props.routeName || props.descriptor?.route?.name || "unknown"

    const focused = focusedTab === routeName

    return (
        <TouchableOpacity
            {...otherProps}
            onPress={onPress}
            style={[
                customTabButtonStyles.container,
                focused ? customTabButtonStyles.focused : customTabButtonStyles.unfocused,
            ]}>
            {children}
        </TouchableOpacity>
    )
}

export const TabStack = () => {
    const theme = useTheme()
    const currentScreen = useAppSelector(selectCurrentScreen)
    const [focusedTab, setFocusedTab] = useState<string>("HomeStack")

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isShowBackupModal = useCheckWalletBackup(selectedAccount)

    const renderTabBarIcon = useCallback(
        (focused: boolean, iconName: IconKey) => {
            const isSettings = iconName === "icon-menu"

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

    // Create a custom tabBarButton that tracks the focused tab
    const createTabBarButton = useCallback((routeName: string) => {
        return (props: any) => {
            const enhancedProps = {
                ...props,
                route: { name: routeName },
                onPress: () => {
                    setFocusedTab(routeName)
                    props.onPress?.()
                },
            }
            return <CustomTabButton {...enhancedProps} />
        }
    }, [])

    const display = useMemo(() => {
        switch (currentScreen) {
            case Routes.SETTINGS_GET_SUPPORT:
            case Routes.SETTINGS_GIVE_FEEDBACK:
            case Routes.BROWSER:
            case Routes.TOKEN_DETAILS:
            case Routes.DISCOVER_TABS_MANAGER:
                return "none"

            case "":
                return "none"

            default:
                return "flex"
        }
    }, [currentScreen])

    return (
        <FocusedTabContext.Provider value={focusedTab}>
            <Tab.Navigator
                screenOptions={() => ({
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        display,
                        backgroundColor: theme.colors.card,
                        ...tabbarBaseStyles.tabbar,
                        ...tabbarBaseStyles.shadow,
                    },
                    lazy: true,
                })}>
                <Tab.Screen
                    name="HomeStack"
                    component={HomeStack}
                    options={{
                        tabBarLabel: "Wallet",
                        tabBarTestID: "wallet-tab",
                        tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-home"),
                        tabBarButton: createTabBarButton("HomeStack"),
                    }}
                />

                <Tab.Screen
                    name="NFTStack"
                    component={NFTStack}
                    options={{
                        tabBarLabel: "NFT",
                        tabBarTestID: "nft-tab",
                        tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-image"),
                        tabBarButton: createTabBarButton("NFTStack"),
                    }}
                />

                <Tab.Screen
                    name="DiscoverStack"
                    component={DiscoverStack}
                    options={{
                        tabBarLabel: "Discover",
                        tabBarTestID: "discover-tab",
                        tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-explorer"),
                        tabBarButton: createTabBarButton("DiscoverStack"),
                    }}
                />

                <Tab.Screen
                    name={Routes.HISTORY_STACK}
                    component={HistoryStack}
                    options={{
                        tabBarLabel: Routes.HISTORY,
                        tabBarTestID: "history-tab",
                        tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-history"),
                        tabBarButton: createTabBarButton(Routes.HISTORY_STACK),
                    }}
                />

                <Tab.Screen
                    name="SettingsStack"
                    component={SettingsStack}
                    options={{
                        tabBarLabel: "Settings",
                        tabBarTestID: "settings-tab",
                        tabBarIcon: ({ focused }) => renderTabBarIcon(focused, "icon-menu"),
                        tabBarButton: createTabBarButton("SettingsStack"),
                    }}
                />
            </Tab.Navigator>
        </FocusedTabContext.Provider>
    )
}

const customTabButtonStyles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 50,
    },
    focused: {
        backgroundColor: COLORS.DARK_PURPLE,
    },
    unfocused: {
        backgroundColor: "transparent",
    },
})

export const tabbarBaseStyles = StyleSheet.create({
    tabbar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 0,
        paddingHorizontal: 8,
        paddingTop: 12,
        height: PlatformUtils.isIOS() ? 90 : 60,
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
