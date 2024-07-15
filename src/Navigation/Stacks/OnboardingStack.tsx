import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    EnableAdditionalSettings,
    ImportFromCloudScreen,
    ImportLocalWallet,
    SelectLedgerAccounts,
    SelectLedgerDevice,
    WelcomeScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { ConnectedLedgerDevice } from "~Model"
import { useNavAnimation } from "~Hooks"

export type RootStackParamListOnboarding = {
    [Routes.WELCOME]: undefined
    [Routes.IMPORT_MNEMONIC]: undefined
    [Routes.IMPORT_HW_LEDGER_SELECT_DEVICE]: undefined
    [Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS]: {
        device: ConnectedLedgerDevice
    }
    [Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS]: {
        device: ConnectedLedgerDevice
    }
    [Routes.IMPORT_FROM_CLOUD]: undefined
}

const Onboarding = createNativeStackNavigator<RootStackParamListOnboarding>()

export const OnboardingStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Onboarding.Navigator screenOptions={{ headerShown: false, animation }}>
            <Onboarding.Screen name={Routes.WELCOME} component={WelcomeScreen} options={{ headerShown: false }} />

            <Onboarding.Screen
                name={Routes.IMPORT_MNEMONIC}
                component={ImportLocalWallet}
                options={{ headerShown: false }}
            />

            <Onboarding.Screen
                name={Routes.IMPORT_HW_LEDGER_SELECT_DEVICE}
                component={SelectLedgerDevice}
                options={{ headerShown: false }}
            />

            <Onboarding.Screen
                name={Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS}
                component={EnableAdditionalSettings}
                options={{ headerShown: false }}
            />

            <Onboarding.Screen
                name={Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS}
                component={SelectLedgerAccounts}
                options={{ headerShown: false }}
            />

            <Onboarding.Screen
                name={Routes.IMPORT_FROM_CLOUD}
                component={ImportFromCloudScreen}
                options={{ headerShown: false }}
            />
        </Onboarding.Navigator>
    )
}
