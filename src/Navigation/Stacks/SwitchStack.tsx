import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TabStack } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { useAppInitState, AppInitState } from "~Hooks"
import { CreateWalletAppStack, Routes } from "~Navigation"
import BlockListener from "../../BlockListener"
import { BlackListedCollectionsScreen, ConnectAppScreen } from "~Screens"
import { SignClientTypes } from "@walletconnect/types"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    TabStack: undefined
    ResetAppScreen: undefined
    Create_Wallet_Flow: undefined
    Blacklisted_Collections: undefined
    Connect_App_Screen: {
        sessionProposal: SignClientTypes.EventArguments["session_proposal"]
    }
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
                <>
                    <Switch.Screen
                        name="TabStack"
                        component={AppContainer}
                        options={{ headerShown: false }}
                    />

                    {/* Full screen modals */}
                    <Switch.Group
                        screenOptions={{
                            headerShown: false,
                        }}>
                        <Switch.Screen
                            name={Routes.CREATE_WALLET_FLOW}
                            component={CreateWalletAppStack}
                        />

                        <Switch.Screen
                            name={Routes.BLACKLISTED_COLLECTIONS}
                            component={BlackListedCollectionsScreen}
                            options={{
                                presentation: "modal",
                            }}
                        />

                        <Switch.Screen
                            name={Routes.CONNECT_APP_SCREEN}
                            component={ConnectAppScreen}
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

const AppContainer = () => {
    return (
        <>
            <BlockListener />
            <TabStack />
        </>
    )
}
