import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useDevice } from "~Components/Providers/DeviceProvider"
import { Activity } from "~Model/Activity"
import { FungibleToken } from "~Model/Token"
import { TransactionOutcomes } from "~Model/Transaction"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import { ActivityDetailsScreen } from "~Screens/Flows/App/ActivityDetailsScreen"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen/AppsSearchScreen"
import { InAppBrowser } from "~Screens/Flows/App/InAppBrowser"
import { ProfileScreen } from "~Screens/Flows/App/ProfileScreen"
import { TabsManagerScreen } from "~Screens/Flows/App/TabsManagerScreen"

export type RootStackParamListProfile = {
    [Routes.PROFILE]: undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?:
            | Routes.SETTINGS
            | Routes.HOME
            | Routes.ACTIVITY_STAKING
            | Routes.APPS
            | Routes.SWAP
            | Routes.COLLECTIBLES_COLLECTION_DETAILS
            | Routes.PROFILE
    }
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.APPS_SEARCH]: undefined
    [Routes.ACTIVITY_DETAILS]: {
        activity: Activity
        token?: FungibleToken
        isSwap?: boolean
        decodedClauses?: TransactionOutcomes
        returnScreen?: Routes.HOME | Routes.HISTORY | Routes.PROFILE
    }
}

const { Navigator, Screen } = createStackNavigator<RootStackParamListProfile>()

export const ProfileStack = () => {
    const { isLowEndDevice } = useDevice()

    return (
        <Navigator
            screenOptions={{ headerShown: false, animationEnabled: !isLowEndDevice }}
            initialRouteName={Routes.PROFILE}>
            <Screen name={Routes.PROFILE} component={ProfileScreen} />
            <Screen
                name={Routes.BROWSER}
                component={InAppBrowser}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                    gestureEnabled: true,
                }}
            />
            <Screen
                name={Routes.APPS_TABS_MANAGER}
                component={TabsManagerScreen}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                    gestureEnabled: true,
                }}
            />
            <Screen
                name={Routes.APPS_SEARCH}
                component={AppsSearchScreen}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                    gestureEnabled: true,
                }}
            />
            <Screen name={Routes.ACTIVITY_DETAILS} component={ActivityDetailsScreen} options={{ headerShown: false }} />
        </Navigator>
    )
}
