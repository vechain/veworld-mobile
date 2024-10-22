import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { useNavAnimation } from "~Hooks"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation/Enums"
import { ActivityDetailsScreen, HistoryScreen } from "~Screens"

export type HistoryStackParamList = {
    [Routes.HISTORY]: undefined
    [Routes.ACTIVITY_DETAILS]: {
        activity: Activity
        token?: FungibleToken
        isSwap?: boolean
        decodedClauses?: TransactionOutcomes
    }
}

const { Navigator, Screen } = createNativeStackNavigator<HistoryStackParamList>()

export const HistoryStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="HistoryStack" screenOptions={{ headerShown: false, animation }}>
            <Screen name={Routes.HISTORY} component={HistoryScreen} options={{ headerShown: false }} />
            <Screen name={Routes.ACTIVITY_DETAILS} component={ActivityDetailsScreen} options={{ headerShown: false }} />
        </Navigator>
    )
}
