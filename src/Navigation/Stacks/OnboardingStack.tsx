import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {
    OnboardingScreen,
    SecurityScreen,
    TutorialScreen,
    WelcomeScreen,
} from '~Screens'

export type RootStackParamListOnboarding = {
    Welcome: undefined
    Onboarding: undefined
    Security: undefined
    Wallet_Tutorial: undefined
}

const Onboarding = createNativeStackNavigator<RootStackParamListOnboarding>()

export const OnboardingStack = () => {
    return (
        <Onboarding.Navigator screenOptions={{headerShown: false}}>
            <Onboarding.Group>
                <Onboarding.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{headerShown: false}}
                />

                <Onboarding.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                    options={{headerShown: false}}
                />

                <Onboarding.Screen
                    name="Security"
                    component={SecurityScreen}
                    options={{headerShown: false}}
                />

                <Onboarding.Screen
                    name="Wallet_Tutorial"
                    component={TutorialScreen}
                    options={{headerShown: false}}
                />
            </Onboarding.Group>
        </Onboarding.Navigator>
    )
}
