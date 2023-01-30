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
} from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListOnboarding = {
    Welcome: undefined
    Onboarding: undefined
    Wallet_Tutorial: undefined
    Wallet_Type_Creation: undefined
    Seed_Phrase: undefined
    Confirm_Seed_Phrase: undefined
    User_Create_Password: undefined
    App_Security: undefined
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
                    name={Routes.APP_SECURITY}
                    component={AppSecurityScreen}
                    options={{ headerShown: false }}
                />
            </Onboarding.Group>

            <Onboarding.Group
                screenOptions={{
                    presentation: "fullScreenModal",
                }}>
                <Onboarding.Screen
                    name={Routes.USER_CREATE_PASSWORD}
                    component={UserCreatePasswordScreen}
                    options={{ headerShown: false }}
                />
            </Onboarding.Group>
        </Onboarding.Navigator>
    )
}
