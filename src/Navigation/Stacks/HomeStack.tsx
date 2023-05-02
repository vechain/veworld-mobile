import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    ManageTokenScreen,
    BuyScreen,
    HistoryScreen,
    HomeScreen,
    SendScreen,
    SwapScreen,
    WalletManagementScreen,
    ManageCustomTokenScreen,
    ActivityDetailsScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { Activity, FungibleToken } from "~Model"

export type RootStackParamListHome = {
    [Routes.HOME]: undefined
    [Routes.BUY]: undefined
    [Routes.SEND]: undefined
    [Routes.SWAP]: undefined
    [Routes.HISTORY]: undefined
    [Routes.MANAGE_TOKEN]: undefined
    [Routes.MANAGE_CUSTOM_TOKEN]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
    [Routes.ACTIVITY_DETAILS]: { activity: Activity; token?: FungibleToken }
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
                <Screen
                    name={Routes.ACTIVITY_DETAILS}
                    component={ActivityDetailsScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.MANAGE_TOKEN}
                    component={ManageTokenScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.MANAGE_CUSTOM_TOKEN}
                    component={ManageCustomTokenScreen}
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
        </Navigator>
    )
}
