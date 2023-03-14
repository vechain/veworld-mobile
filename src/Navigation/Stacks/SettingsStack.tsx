import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    AdvancedScreen,
    ChangeNetworkScreen,
    CustomNetworkScreen,
    GeneralScreen,
    PrivacyScreen,
    SettingsScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListSettings = {
    [Routes.SETTINGS]: undefined
    [Routes.SETTINGS_NETWORK]: undefined
    [Routes.SETTINGS_CUSTOM_NET]: undefined
    [Routes.SETTINGS_PRIVACY]: undefined
    [Routes.SETTINGS_ADVANCED]: undefined
    [Routes.SETTINGS_GENERAL]: undefined
}

const Settings = createNativeStackNavigator<RootStackParamListSettings>()

export const SettingsStack = () => {
    return (
        <Settings.Navigator screenOptions={{ headerShown: false }}>
            <Settings.Group>
                <Settings.Screen
                    name={Routes.SETTINGS}
                    component={SettingsScreen}
                    options={{ headerShown: false }}
                />
                <Settings.Screen
                    name={Routes.SETTINGS_NETWORK}
                    component={ChangeNetworkScreen}
                    options={{ headerShown: false }}
                />

                <Settings.Screen
                    name={Routes.SETTINGS_CUSTOM_NET}
                    component={CustomNetworkScreen}
                    options={{ headerShown: false }}
                />

                <Settings.Screen
                    name={Routes.SETTINGS_PRIVACY}
                    component={PrivacyScreen}
                    options={{ headerShown: false }}
                />

                <Settings.Screen
                    name={Routes.SETTINGS_ADVANCED}
                    component={AdvancedScreen}
                    options={{ headerShown: false }}
                />

                <Settings.Screen
                    name={Routes.SETTINGS_GENERAL}
                    component={GeneralScreen}
                    options={{ headerShown: false }}
                />
            </Settings.Group>
        </Settings.Navigator>
    )
}
