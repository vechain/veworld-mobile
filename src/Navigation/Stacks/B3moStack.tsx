import { createStackNavigator } from "@react-navigation/stack"
import React, { useMemo } from "react"
import { Routes } from "~Navigation/Enums"
import {
    B3moChatScreen,
    B3moHistoryScreen,
    B3moIntroScreen,
    B3moPickWalletScreen,
    B3moSettingsScreen,
    B3moUnlockScreen,
    B3moWalletChoiceScreen,
} from "~Screens/Flows/App/B3moScreen"
import { useAppSelector } from "~Storage/Redux"
import { selectIsB3moOnboarded, selectIsB3moSessionUnlocked } from "~Storage/Redux/Selectors/B3mo"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type RootStackParamListB3mo = {
    [Routes.B3MO_ONBOARDING_INTRO]: undefined
    [Routes.B3MO_ONBOARDING_WALLET_CHOICE]: undefined
    [Routes.B3MO_ONBOARDING_PICK_WALLET]: undefined
    [Routes.B3MO_ONBOARDING_UNLOCK]: undefined
    [Routes.B3MO_CHAT]: undefined
    [Routes.B3MO_HISTORY]: undefined
    [Routes.B3MO_SETTINGS]: undefined
}

const { Navigator, Screen } = createStackNavigator<RootStackParamListB3mo>()

export const B3moStack = () => {
    const isOnboarded = useAppSelector(selectIsB3moOnboarded)
    const isUnlocked = useAppSelector(selectIsB3moSessionUnlocked)

    const initialRoute = useMemo<keyof RootStackParamListB3mo>(() => {
        if (!isOnboarded) return Routes.B3MO_ONBOARDING_INTRO
        if (!isUnlocked) return Routes.B3MO_ONBOARDING_UNLOCK
        return Routes.B3MO_CHAT
    }, [isOnboarded, isUnlocked])

    return (
        <Navigator
            id="B3moStack"
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false, animationEnabled: isIOS() }}>
            <Screen name={Routes.B3MO_ONBOARDING_INTRO} component={B3moIntroScreen} />
            <Screen name={Routes.B3MO_ONBOARDING_WALLET_CHOICE} component={B3moWalletChoiceScreen} />
            <Screen name={Routes.B3MO_ONBOARDING_PICK_WALLET} component={B3moPickWalletScreen} />
            <Screen name={Routes.B3MO_ONBOARDING_UNLOCK} component={B3moUnlockScreen} />
            <Screen name={Routes.B3MO_CHAT} component={B3moChatScreen} />
            <Screen name={Routes.B3MO_HISTORY} component={B3moHistoryScreen} />
            <Screen name={Routes.B3MO_SETTINGS} component={B3moSettingsScreen} />
        </Navigator>
    )
}
