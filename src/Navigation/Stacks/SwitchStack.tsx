import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TabStack } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { AppInitState, useAppInitState } from "~Hooks"
import { CreateWalletAppStack, Routes } from "~Navigation"
import {
    BlackListedCollectionsScreen,
    ConnectAppScreen,
    SendTransactionScreen,
    SignMessageScreen,
} from "~Screens"
import {
    PendingRequestTypes,
    SessionTypes,
    SignClientTypes,
} from "@walletconnect/types"
import { AppBlockedScreen } from "~Screens/Flows/App/AppBlockedScreen"
import { TransferEventListener } from "../../TransferEventListener"

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
        requestEvent: PendingRequestTypes.Struct
        session: SessionTypes.Struct
        message: Connex.Vendor.TxMessage
        options: Connex.Driver.TxOptions
    }
    Connected_App_Sign_Message_Screen: {
        requestEvent: PendingRequestTypes.Struct
        session: SessionTypes.Struct
        message: Connex.Vendor.CertMessage
        options: Connex.Driver.CertOptions
    }
    Blocked_App_Screen: undefined
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
                            name={Routes.BLOCKED_APP_SCREEN}
                            component={AppBlockedScreen}
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
            <TransferEventListener />
            <TabStack />
        </>
    )
}
