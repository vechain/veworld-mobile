import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TabStack } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { AppInitState, useAppInitState } from "~Common"
import { CameraScreen, ResetAppScreen } from "~Screens"
import { CreateWalletAppStack, Routes } from "~Navigation"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    TabStack: undefined
    ResetAppScreen: undefined
    Create_Wallet_Flow: undefined
    Camera: undefined
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
                    <>
                        <Switch.Screen
                            name="TabStack"
                            component={TabStack}
                            options={{ headerShown: false }}
                        />
                        {/* Full screen modals */}
                        <Switch.Group
                            screenOptions={{
                                presentation: "fullScreenModal",
                            }}>
                            <Switch.Screen
                                name={Routes.CREATE_WALLET_FLOW}
                                component={CreateWalletAppStack}
                                options={{ headerShown: false }}
                            />

                            <Switch.Screen
                                name={Routes.CAMERA}
                                component={CameraScreen}
                                options={{ headerShown: false }}
                            />
                        </Switch.Group>
                    </>
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
