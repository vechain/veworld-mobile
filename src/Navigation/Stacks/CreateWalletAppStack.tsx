import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    EnableAdditionalSettings,
    ImportFromCloudScreen,
    ImportLocalWallet,
    ImportMnemonicBackupPasswordScreen,
    SelectLedgerAccounts,
    SelectLedgerDevice,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { CloudKitWallet, ConnectedLedgerDevice, DrivetWallet } from "~Model"
import { useNavAnimation } from "~Hooks"
import { SmartAccountScreen } from "../../Screens/Flows/WalletCreation/SmartAccount"

export type RootStackParamListCreateWalletApp = {
    Home: undefined
    [Routes.IMPORT_MNEMONIC]: undefined
    [Routes.IMPORT_HW_LEDGER_SELECT_DEVICE]: undefined
    [Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS]: {
        device: ConnectedLedgerDevice
    }
    [Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS]: {
        device: ConnectedLedgerDevice
    }
    [Routes.IMPORT_FROM_CLOUD]: {
        wallets: CloudKitWallet[] | DrivetWallet[]
    }
    [Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD]: {
        wallet: CloudKitWallet | DrivetWallet
    }
    [Routes.IMPORT_SMART_ACCOUNT]: undefined
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

            <CreateWalletApp.Screen
                name={Routes.IMPORT_FROM_CLOUD}
                component={ImportFromCloudScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD}
                component={ImportMnemonicBackupPasswordScreen}
                options={{
                    headerShown: false,
                }}
            />
            <CreateWalletApp.Screen
                name={Routes.IMPORT_SMART_ACCOUNT}
                component={SmartAccountScreen}
                options={{
                    headerShown: false,
                }}
            />
        </CreateWalletApp.Navigator>
    )
}
