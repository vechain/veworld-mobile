import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    OnboardingScreen,
    WelcomeScreen,
    SeedPhraseScreen,
    TutorialScreen,
    WalletTypeSelectionScreen,
    ConfirmSeedPhraseScreen,
    AppSecurityScreen,
    UserCreatePasswordScreen,
    ImportWalletTypeSelectionScreen,
    ImportSeedPhraseScreen,
    WalletSuccessScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { SecurityLevelType } from "~Model"

export type RootStackParamListOnboarding = {
    [Routes.WELCOME]: undefined
    [Routes.ONBOARDING]: undefined
    [Routes.WALLET_TUTORIAL]: undefined
    [Routes.WALLET_TPYE_CREATION]: undefined
    [Routes.WALLET_TPYE_IMPORT]: undefined
    [Routes.SEED_PHRASE]: undefined
    [Routes.CONFIRM_SEED_PHRASE]: undefined
    [Routes.IMPORT_SEED_PHRASE]: undefined
    [Routes.USER_CREATE_PASSWORD]: undefined
    [Routes.APP_SECURITY]: undefined
    [Routes.WALLET_SUCCESS]:
        | {
              securityLevelSelected?: SecurityLevelType
              userPin?: string
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
                    name={Routes.WALLET_TPYE_CREATION}
                    component={WalletTypeSelectionScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.WALLET_TPYE_IMPORT}
                    component={ImportWalletTypeSelectionScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.WALLET_TUTORIAL}
                    component={TutorialScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.SEED_PHRASE}
                    component={SeedPhraseScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.CONFIRM_SEED_PHRASE}
                    component={ConfirmSeedPhraseScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.IMPORT_SEED_PHRASE}
                    component={ImportSeedPhraseScreen}
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
