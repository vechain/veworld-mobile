import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useDevice } from "~Components/Providers/DeviceProvider"
import { Routes } from "~Navigation/Enums"
import { SellTradeHistoryScreen, SellWebviewScreen } from "~Screens/Flows/App/SellScreen"
import { OffRampProvidersEnum } from "~Screens/Flows/App/SellScreen/constants"

export type RootStackParamListSell = {
    [Routes.SELL_WEBVIEW]: {
        provider: OffRampProvidersEnum
    }
    [Routes.SELL_TRADE_HISTORY]: {
        provider: OffRampProvidersEnum
    }
}

const { Navigator, Group, Screen } = createStackNavigator<RootStackParamListSell>()

export const SellStack = () => {
    const { isLowEndDevice } = useDevice()

    return (
        <Navigator
            screenOptions={{ headerShown: false, animationEnabled: !isLowEndDevice }}
            initialRouteName={Routes.SELL_WEBVIEW}>
            <Group>
                <Screen
                    name={Routes.SELL_WEBVIEW}
                    component={SellWebviewScreen}
                    initialParams={{
                        provider: OffRampProvidersEnum.Coinify,
                    }}
                />
                <Screen
                    name={Routes.SELL_TRADE_HISTORY}
                    component={SellTradeHistoryScreen}
                    initialParams={{
                        provider: OffRampProvidersEnum.Coinify,
                    }}
                />
            </Group>
        </Navigator>
    )
}
