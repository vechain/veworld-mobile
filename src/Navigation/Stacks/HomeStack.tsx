import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    ManageTokenScreen,
    BuyScreen,
    HistoryScreen,
    HomeScreen,
    SelectTokenSendScreen,
    SelectAmountSendScreen,
    InsertAddressSendScreen,
    SwapScreen,
    WalletManagementScreen,
    ManageCustomTokenScreen,
    TransactionSummarySendScreen,
    ActivityDetailsScreen,
    AssetDetailScreen,
    ConnectedAppsScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import {
    Activity,
    FungibleToken,
    FungibleTokenWithBalance,
    TokenWithCompleteInfo,
    TransactionOutcomes,
} from "~Model"

export type RootStackParamListHome = {
    [Routes.HOME]: undefined
    [Routes.BUY]: undefined
    [Routes.SELECT_TOKEN_SEND]: { initialRoute: string }
    [Routes.SELECT_AMOUNT_SEND]: {
        token: FungibleTokenWithBalance
        initialRoute: string
    }
    [Routes.INSERT_ADDRESS_SEND]: {
        token: FungibleTokenWithBalance
        amount: string
        initialRoute: string
    }
    [Routes.TRANSACTION_SUMMARY_SEND]: {
        token: FungibleTokenWithBalance
        amount: string
        address: string
        initialRoute: string
    }
    [Routes.SWAP]: undefined
    [Routes.HISTORY]: undefined
    [Routes.MANAGE_TOKEN]: undefined
    [Routes.MANAGE_CUSTOM_TOKEN]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
    [Routes.ACTIVITY_DETAILS]: {
        activity: Activity
        token?: FungibleToken
        isSwap?: boolean
        decodedClauses?: TransactionOutcomes
    }
    [Routes.TOKEN_DETAILS]: { token: TokenWithCompleteInfo }
    [Routes.SETTINGS_CONNECTED_APPS]: undefined
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
                    name={Routes.SELECT_TOKEN_SEND}
                    component={SelectTokenSendScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.SELECT_AMOUNT_SEND}
                    component={SelectAmountSendScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.INSERT_ADDRESS_SEND}
                    component={InsertAddressSendScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.TRANSACTION_SUMMARY_SEND}
                    component={TransactionSummarySendScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.SWAP}
                    component={SwapScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.SETTINGS_CONNECTED_APPS}
                    component={ConnectedAppsScreen}
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

                <Screen
                    name={Routes.TOKEN_DETAILS}
                    component={AssetDetailScreen}
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
