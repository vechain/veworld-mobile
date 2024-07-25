import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { EnableAdditionalSettings, ImportLocalWallet, SelectLedgerAccounts, SelectLedgerDevice } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { ConnectedLedgerDevice } from "~Model"
import { useNavAnimation } from "~Hooks"

export type RootStackParamListCreateWalletApp = {
    Home: undefined
    [Routes.IMPORT_MNEMONIC]: undefined
    [Routes.IMPORT_HW_LEDGER_SELECT_DEVICE]: {
        context: "onboarding" | "management"
    }
    [Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS]: {
        device: ConnectedLedgerDevice
    }
    [Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS]: {
        device: ConnectedLedgerDevice
    }
}

const CreateWalletApp = createNativeStackNavigator<RootStackParamListCreateWalletApp>()

export const CreateWalletAppStack = () => {
    const { animation } = useNavAnimation()

    return (
        <CreateWalletApp.Navigator screenOptions={{ headerShown: false, animation }}>
            <CreateWalletApp.Screen
                name={Routes.IMPORT_MNEMONIC}
                component={ImportLocalWallet}
                options={{ headerShown: false }}
            />
            <CreateWalletApp.Screen
                name={Routes.IMPORT_HW_LEDGER_SELECT_DEVICE}
                component={SelectLedgerDevice}
                options={{ headerShown: false }}
                initialParams={{ context: "management" }}
            />
            <CreateWalletApp.Screen
                name={Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS}
                component={EnableAdditionalSettings}
                options={{ headerShown: false }}
            />
            <CreateWalletApp.Screen
                name={Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS}
                component={SelectLedgerAccounts}
                options={{ headerShown: false }}
            />
        </CreateWalletApp.Navigator>
    )
}
