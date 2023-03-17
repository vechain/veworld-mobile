import React from "react"
import { StyleSheet } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { TabIcon } from "~Components"
import { useTheme } from "~Common"
import PlatformUtils from "~Common/Utils/PlatformUtils"
import { HomeStack, SettingsStack } from "~Navigation/Stacks"

const Tab = createBottomTabNavigator()

export const Tabbar = () => {
    const theme = useTheme()

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    ...baseStyles.tabbar,
                    ...baseStyles.shadow,
                },
            }}>
            <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={{
                    tabBarLabel: "Wallet",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} title={"home"} />
                    ),
                }}
            />

            <Tab.Screen
                name="SettingsStack"
                component={SettingsStack}
                options={{
                    tabBarLabel: "Settings",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} title={"cog"} />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}

const baseStyles = StyleSheet.create({
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
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
})
