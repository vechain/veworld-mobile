import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    AddTokenScreen,
    BuyScreen,
    CameraScreen,
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
    [Routes.ADD_TOKEN]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
    [Routes.CAMERA]: undefined
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
                    name={Routes.ADD_TOKEN}
                    component={AddTokenScreen}
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

                <Screen
                    name={Routes.CAMERA}
                    component={CameraScreen}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
