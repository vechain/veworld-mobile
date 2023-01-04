import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {OnboardingScreen, WelcomeScreen} from '~Screens'

export type RootStackParamListOnboarding = {
    Welcome: undefined
    Onboarding: undefined
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
            </Onboarding.Group>
        </Onboarding.Navigator>
    )
}
