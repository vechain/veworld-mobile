import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    OnboardingScreen,
    SecurityScreen,
    SeedPhraseScreen,
    TutorialScreen,
    WalletTypeSelectionScreen,
    WelcomeScreen,
    UserPasswordScreen,
    ConfirmSeedPhraseScreen,
} from "~Screens"

export type RootStackParamListOnboarding = {
    Welcome: undefined
    Onboarding: undefined
    Security: undefined
    Wallet_Tutorial: undefined
    Wallet_Type_Creation: undefined
    Seed_Phrase: undefined
    User_Password: undefined
    Confirm_Seed_Phrase: undefined
}

const Onboarding = createNativeStackNavigator<RootStackParamListOnboarding>()

export const OnboardingStack = () => {
    return (
        <Onboarding.Navigator screenOptions={{ headerShown: false }}>
            <Onboarding.Group>
                <Onboarding.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name="Wallet_Type_Creation"
                    component={WalletTypeSelectionScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name="Wallet_Tutorial"
                    component={TutorialScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name="Seed_Phrase"
                    component={SeedPhraseScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name="Confirm_Seed_Phrase"
                    component={ConfirmSeedPhraseScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name="Security"
                    component={SecurityScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name="User_Password"
                    component={UserPasswordScreen}
                    options={{ headerShown: false }}
                />
            </Onboarding.Group>
        </Onboarding.Navigator>
    )
}
