import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    ActivityDetailsScreen,
    AssetDetailScreen,
    BuyScreen,
    ConnectedAppsScreen,
    HistoryScreen,
    HomeScreen,
    InsertAddressSendScreen,
    LedgerSignTransaction,
    ManageCustomTokenScreen,
    ManageTokenScreen,
    SelectAmountSendScreen,
    SelectTokenSendScreen,
    SwapScreen,
    TransactionSummarySendScreen,
    WalletManagementScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import {
    Activity,
    FungibleToken,
    FungibleTokenWithBalance,
    LedgerAccountWithDevice,
    TokenWithCompleteInfo,
    TransactionOutcomes,
} from "~Model"
import { Transaction } from "thor-devkit"

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
    [Routes.LEDGER_SIGN_TRANSACTION]: {
        accountWithDevice: LedgerAccountWithDevice
        delegationSignature?: string
        transaction: Transaction
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
        <Navigator id="HomeStack">
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
                    name={Routes.LEDGER_SIGN_TRANSACTION}
                    component={LedgerSignTransaction}
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
