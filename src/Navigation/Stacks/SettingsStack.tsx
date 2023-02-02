import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SettingsScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListSettings = {
    Settings: undefined
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
            </Settings.Group>
        </Settings.Navigator>
    )
}
