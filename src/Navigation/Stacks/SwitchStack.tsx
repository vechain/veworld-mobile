import React, { useMemo, useState } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Tabbar } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { WalletStack } from "./WalletStack"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    WalletStack: undefined
    Tabbar: undefined
}
const Switch = createNativeStackNavigator<RootStackParamListSwitch>()

export const SwitchStack = () => {
    const [isWallet] = useState(false)
    const [isAppSecured] = useState(false)

    const RenderStacks = useMemo(() => {
        if (isWallet) {
            return (
                <Switch.Screen
                    name="Tabbar"
                    component={Tabbar}
                    options={{ headerShown: false }}
                />
            )
        } else if (isAppSecured) {
            return (
                <Switch.Screen
                    name="WalletStack"
                    component={WalletStack}
                    options={{ headerShown: false }}
                />
            )
        } else {
            return (
                <Switch.Screen
                    name="OnboardingStack"
                    component={OnboardingStack}
                    options={{ headerShown: false }}
                />
            )
        }
    }, [isAppSecured, isWallet])

    return (
        <Switch.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            {RenderStacks}
        </Switch.Navigator>
    )
}
