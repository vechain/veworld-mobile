import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    OnboardingScreen,
    WelcomeScreen,
    NewMnemonicScreen,
    TutorialScreen,
    WalletTypeSelectionScreen,
    ConfirmMnemonicScreen,
    AppSecurityScreen,
    UserCreatePasswordScreen,
    ImportWalletTypeSelectionScreen,
    ImportMnemonicScreen,
    WalletSuccessScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { SecurityLevelType } from "~Model"

export type RootStackParamListOnboarding = {
    [Routes.WELCOME]: undefined
    [Routes.ONBOARDING]: undefined
    [Routes.WALLET_TUTORIAL]: undefined
    [Routes.WALLET_TYPE_CREATION]: undefined
    [Routes.WALLET_TYPE_IMPORT]: undefined
    [Routes.NEW_MNEMONIC]: undefined
    [Routes.CONFIRM_MNEMONIC]: undefined
    [Routes.IMPORT_MNEMONIC]: undefined
    [Routes.USER_CREATE_PASSWORD]: undefined
    [Routes.APP_SECURITY]: undefined
    [Routes.WALLET_SUCCESS]:
        | {
              securityLevelSelected: SecurityLevelType.BIOMETRICS
          }
        | {
              securityLevelSelected: SecurityLevelType.PASSWORD
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
                    name={Routes.ONBOARDING}
                    component={OnboardingScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.WALLET_TYPE_CREATION}
                    component={WalletTypeSelectionScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.WALLET_TYPE_IMPORT}
                    component={ImportWalletTypeSelectionScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.WALLET_TUTORIAL}
                    component={TutorialScreen}
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
                    name={Routes.WALLET_SUCCESS}
                    component={WalletSuccessScreen}
                    options={{ headerShown: false }}
                />
            </Onboarding.Group>
        </Onboarding.Navigator>
    )
}
