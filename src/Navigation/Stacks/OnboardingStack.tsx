import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    WelcomeScreen,
    NewMnemonicScreen,
    WalletSetupScreen,
    ConfirmMnemonicScreen,
    AppSecurityScreen,
    UserCreatePasswordScreen,
    ImportMnemonicScreen,
    WalletSuccessScreen,
    SelectLedgerDevice,
    SelectLedgerAccounts,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { ConnectedLedgerDevice, SecurityLevelType } from "~Model"

export type RootStackParamListOnboarding = {
    [Routes.WELCOME]: undefined
    [Routes.WALLET_SETUP]: undefined
    [Routes.NEW_MNEMONIC]: undefined
    [Routes.CONFIRM_MNEMONIC]: undefined
    [Routes.IMPORT_MNEMONIC]: undefined
    [Routes.USER_CREATE_PASSWORD]: undefined
    [Routes.APP_SECURITY]: undefined
    [Routes.IMPORT_HW_LEDGER_SELECT_DEVICE]: undefined
    [Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS]: {
        device: ConnectedLedgerDevice
    }
    [Routes.WALLET_SUCCESS]:
        | {
              securityLevelSelected: SecurityLevelType.BIOMETRIC
          }
        | {
              securityLevelSelected: SecurityLevelType.SECRET
              userPin: string
          }
        | undefined
}

const Onboarding = createNativeStackNavigator<RootStackParamListOnboarding>()

export const OnboardingStack = () => {
    return (
        <Onboarding.Navigator screenOptions={{ headerShown: false }}>
            <Onboarding.Group>
                <Onboarding.Screen
                    name={Routes.WELCOME}
                    component={WelcomeScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.WALLET_SETUP}
                    component={WalletSetupScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.NEW_MNEMONIC}
                    component={NewMnemonicScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.CONFIRM_MNEMONIC}
                    component={ConfirmMnemonicScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.IMPORT_MNEMONIC}
                    component={ImportMnemonicScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.APP_SECURITY}
                    component={AppSecurityScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.USER_CREATE_PASSWORD}
                    component={UserCreatePasswordScreen}
                    options={{ headerShown: false }}
                />
                <Onboarding.Screen
                    name={Routes.IMPORT_HW_LEDGER_SELECT_DEVICE}
                    component={SelectLedgerDevice}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS}
                    component={SelectLedgerAccounts}
                    options={{ headerShown: false }}
                />
                <Onboarding.Screen
                    name={Routes.WALLET_SUCCESS}
                    component={WalletSuccessScreen}
                    options={{ headerShown: false }}
                />
            </Onboarding.Group>
        </Onboarding.Navigator>
    )
}
