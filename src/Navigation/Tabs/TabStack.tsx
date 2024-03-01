import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { TabIcon } from "~Components"
import { useTheme } from "~Hooks"
import PlatformUtils from "~Utils/PlatformUtils"
import { DiscoverStack, HomeStack, SettingsStack } from "~Navigation/Stacks"
import { NFTStack } from "~Navigation/Stacks/NFTStack"
import { selectCurrentScreen, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { Routes } from "~Navigation/Enums"
import { NETWORK_TYPE } from "~Model"

const Tab = createBottomTabNavigator()

export const TabStack = () => {
    const theme = useTheme()
    const currentScreen = useAppSelector(selectCurrentScreen)
    const network = useAppSelector(selectSelectedNetwork)

    const renderTabBarIcon = useCallback(
        (focused: boolean, iconName: string) => <TabIcon focused={focused} title={iconName} />,
        [],
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
                name="SettingsStack"
                component={SettingsStack}
                options={{
                    tabBarLabel: "Settings",
                    tabBarTestID: "settings-tab",
                    tabBarIcon: ({ focused }) => renderTabBarIcon(focused, focused ? "cog" : "cog-outline"),
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
