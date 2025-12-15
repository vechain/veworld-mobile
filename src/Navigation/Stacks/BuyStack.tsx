import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useDevice } from "~Components/Providers/DeviceProvider"
import { Routes } from "~Navigation/Enums"
import { BuyScreen, BuyWebviewScreen } from "~Screens"
import { PaymentProvidersEnum } from "~Screens/Flows/App/BuyScreen/Hooks"

export type RootStackParamListBuy = {
    [Routes.BUY]: undefined
    [Routes.BUY_WEBVIEW]: {
        provider: PaymentProvidersEnum
        providerName: string
    }
}

const { Navigator, Group, Screen } = createStackNavigator<RootStackParamListBuy>()

export const BuyStack = () => {
    const { isLowEndDevice } = useDevice()

    return (
        <Navigator screenOptions={{ headerShown: false, animationEnabled: !isLowEndDevice }}>
            <Group>
                <Screen name={Routes.BUY} component={BuyScreen} />
                <Screen name={Routes.BUY_WEBVIEW} component={BuyWebviewScreen} />
            </Group>
        </Navigator>
    )
}
