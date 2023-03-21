import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    BuyScreen,
    HistoryScreen,
    HomeScreen,
    SendScreen,
    SwapScreen,
    WalletManagementScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { CreateWalletAppStack } from "./CreateWalletAppStack"

export type RootStackParamListHome = {
    [Routes.HOME]: undefined
    [Routes.BUY]: undefined
    [Routes.SEND]: undefined
    [Routes.SWAP]: undefined
    [Routes.HISTORY]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
}

const { Navigator, Group, Screen } =
    createNativeStackNavigator<RootStackParamListHome>()

export const HomeStack = () => {
    return (
        <Navigator>
            <Group>
                <Screen
                    name={Routes.HOME}
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.BUY}
                    component={BuyScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.SEND}
                    component={SendScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.SWAP}
                    component={SwapScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.HISTORY}
                    component={HistoryScreen}
                    options={{ headerShown: false }}
                />
            </Group>

            <Group>
                <Screen
                    name={Routes.WALLET_MANAGEMENT}
                    component={WalletManagementScreen}
                    options={{ headerShown: false }}
                />
            </Group>

            <Group
                screenOptions={{
                    presentation: "fullScreenModal",
                }}>
                <Screen
                    name={Routes.CREATE_WALLET_FLOW}
                    component={CreateWalletAppStack}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
