import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Tabbar } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { AppInitState, useAppInitState } from "~Common"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    Tabbar: undefined
}
const Switch = createNativeStackNavigator<RootStackParamListSwitch>()

export const SwitchStack = () => {
    const state = useAppInitState()

    const RenderStacks = useMemo(() => {
        if (state === AppInitState.INIT_STATE) {
            return (
                <Switch.Screen
                    name="OnboardingStack"
                    component={OnboardingStack}
                    options={{ headerShown: false }}
                />
            )
        } else {
            return (
                <Switch.Screen
                    name="Tabbar"
                    component={Tabbar}
                    options={{ headerShown: false }}
                />
            )
        }
    }, [state])

    return (
        <Switch.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            {RenderStacks}
        </Switch.Navigator>
    )
}
