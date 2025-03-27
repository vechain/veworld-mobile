import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { useNavAnimation } from "~Hooks"
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

const { Navigator, Group, Screen } = createNativeStackNavigator<RootStackParamListSell>()

export const SellStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator screenOptions={{ headerShown: false, animation }} initialRouteName={Routes.SELL_WEBVIEW}>
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
