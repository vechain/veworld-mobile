import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { BuyWebviewScreen } from "~Screens/Flows/App/BuyScreen/BuyWebviewScreen/BuyWebviewScreen"
import { Routes } from "~Navigation/Enums"
import { BuyScreen } from "~Screens"
import { useNavAnimation } from "~Hooks"

export type RootStackParamListBuy = {
    [Routes.BUY]: undefined
    [Routes.BUY_WEBVIEW]: undefined
}

const { Navigator, Group, Screen } =
    createNativeStackNavigator<RootStackParamListBuy>()

export const BuyStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator screenOptions={{ headerShown: false, animation }}>
            <Group>
                <Screen name={Routes.BUY} component={BuyScreen} />
                <Screen
                    name={Routes.BUY_WEBVIEW}
                    component={BuyWebviewScreen}
                />
            </Group>
        </Navigator>
    )
}
