import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { Routes } from "~Navigation/Enums"
import { useNavAnimation } from "~Hooks"
import SocialOnboardingScreen from "../../Screens/Flows/Onboarding/social/SocialOnboardingScreen"
import { SocialUserScreen } from "~Screens/Flows/Onboarding/social/SocialUserScreen"

// Import any screens from HomeStack that you need
import { HomeScreen } from "~Screens"

export type RootStackParamListSocialOnboarding = {
    [Routes.WELCOME]: undefined
    [Routes.SOCIAL_ONBOARDING]: undefined
    [Routes.SOCIAL_USER]: undefined
    // Add routes from HomeStack that you want to access
    [Routes.HOME]: undefined
}

const SocialOnboarding = createNativeStackNavigator<RootStackParamListSocialOnboarding>()

export const SocialOnboardingStack = () => {
    const { animation } = useNavAnimation()

    return (
        <SocialOnboarding.Navigator screenOptions={{ headerShown: false, animation }}>
            <SocialOnboarding.Screen
                name={Routes.SOCIAL_ONBOARDING}
                component={SocialOnboardingScreen}
                options={{ headerShown: false }}
            />

            <SocialOnboarding.Screen
                name={Routes.SOCIAL_USER}
                component={SocialUserScreen}
                options={{ headerShown: false }}
            />
            {/* Add screens from HomeStack that you want to access */}
            <SocialOnboarding.Screen name={Routes.HOME} component={HomeScreen} options={{ headerShown: false }} />
        </SocialOnboarding.Navigator>
    )
}
