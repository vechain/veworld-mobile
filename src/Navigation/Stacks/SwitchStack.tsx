import React, { useState } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Tabbar } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    Tabbar: undefined
}
const Switch = createNativeStackNavigator<RootStackParamListSwitch>()

export const SwitchStack = () => {
    const [isWallet] = useState(false)

    return (
        <Switch.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            {isWallet ? (
                <Switch.Screen
                    name="Tabbar"
                    component={Tabbar}
                    options={{ headerShown: false }}
                />
            ) : (
                <Switch.Screen
                    name="OnboardingStack"
                    component={OnboardingStack}
                    options={{ headerShown: false }}
                />
            )}
        </Switch.Navigator>
    )
}
