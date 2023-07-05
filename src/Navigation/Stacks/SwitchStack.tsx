import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TabStack } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { useAppInitState, AppInitState } from "~Hooks"
import { CreateWalletAppStack, Routes } from "~Navigation"
import BlockListener from "../../BlockListener"
import {
    BlackListedCollectionsScreen,
    ConnectAppScreen,
    SendTransactionScreen,
    SignMessageScreen,
    LedgerSignMessageScreen,
} from "~Screens"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { LedgerAccountWithDevice } from "~Model"
import { Certificate } from "thor-devkit"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    TabStack: undefined
    ResetAppScreen: undefined
    Create_Wallet_Flow: undefined
    Blacklisted_Collections: undefined
    Connect_App_Screen: {
        sessionProposal: SignClientTypes.EventArguments["session_proposal"]
    }
    Connected_App_Send_Transaction_Screen: {
        requestEvent: SignClientTypes.EventArguments["session_request"]
        session: SessionTypes.Struct
    }
    Connected_App_Sign_Message_Screen: {
        requestEvent: SignClientTypes.EventArguments["session_request"]
        session: SessionTypes.Struct
    }
    Ledger_Sign_Message_Screen: {
        accountWithDevice: LedgerAccountWithDevice
        certificate: Certificate
        initialRoute: string
        origin?: string
        requestEvent?: any
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

                        <Switch.Screen
                            name={Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN}
                            component={SendTransactionScreen}
                        />

                        <Switch.Screen
                            name={Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN}
                            component={SignMessageScreen}
                        />

                        <Switch.Screen
                            name={Routes.LEDGER_SIGN_MESSAGE_SCREEN}
                            component={LedgerSignMessageScreen}
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
