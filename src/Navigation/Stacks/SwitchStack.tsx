import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TabStack } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { AppInitState, useAppInitState } from "~Common"
import { ResetAppScreen } from "~Screens"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    TabStack: undefined
    ResetAppScreen: undefined
}
const Switch = createNativeStackNavigator<RootStackParamListSwitch>()

export const SwitchStack = () => {
    const state = useAppInitState()

    const RenderStacks = useMemo(() => {
        switch (state) {
            case AppInitState.INIT_STATE:
                return (
                    <Switch.Screen
                        name="OnboardingStack"
                        component={OnboardingStack}
                        options={{ headerShown: false }}
                    />
                )
            case AppInitState.RESETTING_STATE:
                return (
                    <Switch.Screen
                        name="ResetAppScreen"
                        component={ResetAppScreen}
                        options={{ headerShown: false }}
                    />
                )
            default:
                return (
                    <Switch.Screen
                        name="TabStack"
                        component={TabStack}
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
