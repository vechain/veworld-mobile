import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useFeatureFlags } from "~Components"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import { ActivityDetailsScreen, ActivityScreen, InAppBrowser, TabsManagerScreen } from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"

export type HistoryStackParamList = {
    [Routes.HISTORY]: undefined
    [Routes.ACTIVITY_DETAILS]: {
        activity: Activity
        token?: FungibleToken
        isSwap?: boolean
        decodedClauses?: TransactionOutcomes
    }
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING | Routes.APPS
    }
    [Routes.DISCOVER_TABS_MANAGER]: undefined
    [Routes.DISCOVER_SEARCH]: undefined
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.APPS_SEARCH]: undefined
}

const { Navigator, Screen } = createStackNavigator<HistoryStackParamList>()

export const HistoryStack = () => {
    const { betterWorldFeature } = useFeatureFlags()
    return (
        <Navigator id="HistoryStack" screenOptions={{ headerShown: false }}>
            <Screen name={Routes.HISTORY} component={ActivityScreen} options={{ headerShown: false }} />
            <Screen name={Routes.ACTIVITY_DETAILS} component={ActivityDetailsScreen} options={{ headerShown: false }} />
            <Screen
                name={Routes.BROWSER}
                component={InAppBrowser}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                }}
            />
            <Screen
                name={betterWorldFeature.appsScreen.enabled ? Routes.APPS_TABS_MANAGER : Routes.DISCOVER_TABS_MANAGER}
                component={TabsManagerScreen}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                }}
            />
            <Screen
                name={betterWorldFeature.appsScreen.enabled ? Routes.APPS_SEARCH : Routes.DISCOVER_SEARCH}
                component={AppsSearchScreen}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                }}
            />
        </Navigator>
    )
}
