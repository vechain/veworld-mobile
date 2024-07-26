import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { useNavAnimation } from "~Hooks"
import { Routes } from "~Navigation/Enums"
import { HistoryScreen } from "~Screens"

export type HistoryStackParamList = {
    [Routes.HISTORY]: undefined
}

const { Navigator, Screen } = createNativeStackNavigator<HistoryStackParamList>()

export const HistoryStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="HistoryStack" screenOptions={{ headerShown: false, animation }}>
            <Screen name={Routes.HISTORY} component={HistoryScreen} options={{ headerShown: false }} />
        </Navigator>
    )
}
