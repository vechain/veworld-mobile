import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { PlatformUtils } from "~Utils"
import { BuyWebviewScreen } from "~Screens/Flows/App/BuyScreen/BuyWebviewScreen/BuyWebviewScreen"
import { Routes } from "~Navigation/Enums"
import { BuyScreen } from "~Screens"

export type RootStackParamListBuy = {
    [Routes.BUY]: undefined
    [Routes.BUY_WEBVIEW]: undefined
}

const { Navigator, Group, Screen } =
    createNativeStackNavigator<RootStackParamListBuy>()

export const BuyStack = () => {
    return (
        <Navigator
            screenOptions={{
                animation: PlatformUtils.isIOS() ? "default" : "none",
            }}>
            <Group>
                <Screen
                    name={Routes.BUY}
                    component={BuyScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.BUY_WEBVIEW}
                    component={BuyWebviewScreen}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
