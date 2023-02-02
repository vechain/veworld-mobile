import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { TabIcon, BlurView } from "~Components"
import { useTheme } from "~Common"
import { HomeStack, SettingsStack } from "~Navigation/Stacks"

const Tab = createBottomTabNavigator()

export const Tabbar = () => {
    const theme = useTheme()

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.tabicon,
                tabBarInactiveTintColor: theme.colors.tabiconInactive,
                tabBarStyle: { position: "absolute" },
                tabBarBackground: () => <BlurView />,
            }}>
            <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={{
                    tabBarLabel: "Wallet",
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon
                            focused={focused}
                            size={size}
                            title={"Wallet"}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Settings"
                component={SettingsStack}
                options={{
                    tabBarLabel: "Settings",
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon
                            focused={focused}
                            size={size}
                            title={"Settings"}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}
