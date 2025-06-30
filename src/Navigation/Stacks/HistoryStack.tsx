import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { useNavAnimation } from "~Hooks"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation/Enums"
import { ActivityDetailsScreen, ActivityScreen, InAppBrowser, TabsManagerScreen } from "~Screens"

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
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING
    }
    [Routes.DISCOVER_TABS_MANAGER]: undefined
}

const { Navigator, Screen } = createNativeStackNavigator<HistoryStackParamList>()

export const HistoryStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="HistoryStack" screenOptions={{ headerShown: false, animation }}>
            <Screen name={Routes.HISTORY} component={ActivityScreen} options={{ headerShown: false }} />
            <Screen name={Routes.ACTIVITY_DETAILS} component={ActivityDetailsScreen} options={{ headerShown: false }} />
            <Screen name={Routes.BROWSER} component={InAppBrowser} options={{ headerShown: false }} />
            <Screen
                name={Routes.DISCOVER_TABS_MANAGER}
                component={TabsManagerScreen}
                options={{ headerShown: false }}
            />
        </Navigator>
    )
}
