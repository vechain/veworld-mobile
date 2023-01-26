import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    OnboardingScreen,
    WelcomeScreen,
    UserCreatePasswordScreen,
    AppSecurityScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListOnboarding = {
    Welcome: undefined
    Onboarding: undefined
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
                    name={Routes.APP_SECURITY}
                    component={AppSecurityScreen}
                    options={{ headerShown: false }}
                />

                <Onboarding.Screen
                    name={Routes.USER_CREATE_PASSWORD}
                    component={UserCreatePasswordScreen}
                    options={{ headerShown: false }}
                />
            </Onboarding.Group>

            {/* <Onboarding.Group
                screenOptions={{
                    presentation: "fullScreenModal",

            </Onboarding.Group> */}
        </Onboarding.Navigator>
    )
}
