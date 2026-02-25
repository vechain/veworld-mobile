import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useDevice } from "~Components/Providers/DeviceProvider"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { CloudKitWallet, ConnectedLedgerDevice, DriveWallet } from "~Model"
import { Routes } from "~Navigation/Enums"
import {
    EnableAdditionalSettings,
    ImportFromCloudScreen,
    ImportLocalWallet,
    ImportMnemonicBackupPasswordScreen,
    SelectLedgerAccounts,
    SelectLedgerDevice,
    WelcomeScreen,
    WelcomeScreenV2,
} from "~Screens"

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
    [Routes.IMPORT_FROM_CLOUD]: {
        wallets: CloudKitWallet[] | DriveWallet[]
    }
    [Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD]: {
        wallet: CloudKitWallet | DriveWallet
    }
}

const Onboarding = createStackNavigator<RootStackParamListOnboarding>()

export const OnboardingStack = () => {
    const { isLowEndDevice } = useDevice()

    const { betterWorldFeature } = useFeatureFlags()

    return (
        <Onboarding.Navigator screenOptions={{ headerShown: false, animationEnabled: !isLowEndDevice }}>
            <Onboarding.Screen
                name={Routes.WELCOME}
                component={betterWorldFeature.onboardingScreen.enabled ? WelcomeScreenV2 : WelcomeScreen}
                options={{ headerShown: false }}
            />

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

            <Onboarding.Screen
                name={Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD}
                component={ImportMnemonicBackupPasswordScreen}
                options={{
                    headerShown: false,
                }}
            />
        </Onboarding.Navigator>
    )
}
