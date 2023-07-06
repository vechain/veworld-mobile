import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { TabIcon } from "~Components"
import { useTheme } from "~Hooks"
import PlatformUtils from "~Utils/PlatformUtils" // TODO (Davide) (https://github.com/vechainfoundation/veworld-mobile/issues/748) remove this circular dependency
import { HomeStack, SettingsStack } from "~Navigation/Stacks"
import { NFTStack } from "~Navigation/Stacks/NFTStack"

const Tab = createBottomTabNavigator()

export const TabStack = () => {
    const theme = useTheme()

    const renderTabBarIcon = useCallback(
        (focused: boolean, iconName: string) => (
            <TabIcon focused={focused} title={iconName} />
        ),
        [],
    )
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    ...tabbarBaseStyles.tabbar,
                },
            }}>
            <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={{
                    tabBarLabel: "Wallet",
                    tabBarTestID: "wallet-tab",
                    tabBarIcon: ({ focused }) =>
                        renderTabBarIcon(
                            focused,
                            focused ? "home" : "home-outline",
                        ),
                }}
            />

            <Tab.Screen
                name="NFTStack"
                component={NFTStack}
                options={{
                    tabBarLabel: "NFT",
                    tabBarTestID: "nft-tab",
                    tabBarIcon: ({ focused }) =>
                        renderTabBarIcon(
                            focused,
                            focused
                                ? "image-multiple"
                                : "image-multiple-outline",
                        ),
                }}
            />

            {/* Not to be used in the current cycle */}

            {/* <Tab.Screen
                name="DiscoverStack"
                component={DiscoverStack}
                options={{
                    tabBarLabel: "Settings",
                    tabBarIcon: ({ focused }) =>
                        renderTabBarIcon(
                            focused,
                            focused ? "compass" : "compass-outline",
                        ),
                }}
            /> */}

            <Tab.Screen
                name="SettingsStack"
                component={SettingsStack}
                options={{
                    tabBarLabel: "Settings",
                    tabBarTestID: "settings-tab",
                    tabBarIcon: ({ focused }) =>
                        renderTabBarIcon(
                            focused,
                            focused ? "cog" : "cog-outline",
                        ),
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
})
