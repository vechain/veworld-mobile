import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    ActivityDetailsScreen,
    AssetDetailScreen,
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
    WalletDetailScreen,
    WalletManagementScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import {
    Activity,
    Device,
    FungibleToken,
    FungibleTokenWithBalance,
    LedgerAccountWithDevice,
    TransactionOutcomes,
} from "~Model"
import { Transaction } from "thor-devkit"
import { TokenWithCompleteInfo, useNavAnimation } from "~Hooks"

export type RootStackParamListHome = {
    [Routes.HOME]: undefined
    [Routes.SELECT_TOKEN_SEND]: { initialRoute: Routes }
    [Routes.SELECT_AMOUNT_SEND]: {
        token: FungibleTokenWithBalance
        initialRoute: Routes
    }
    [Routes.INSERT_ADDRESS_SEND]: {
        token?: FungibleTokenWithBalance
        amount?: string
        initialRoute?: Routes
        contractAddress?: string
        tokenId?: string
    }
    [Routes.TRANSACTION_SUMMARY_SEND]: {
        token: FungibleTokenWithBalance
        amount: string
        address: string
    }
    [Routes.LEDGER_SIGN_TRANSACTION]: {
        accountWithDevice: LedgerAccountWithDevice
        delegationSignature?: string
        transaction: Transaction
        initialRoute?: Routes.HOME | Routes.NFTS
    }
    [Routes.SWAP]: undefined
    [Routes.HISTORY]: undefined
    [Routes.MANAGE_TOKEN]: undefined
    [Routes.MANAGE_CUSTOM_TOKEN]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.WALLET_DETAILS]: { device: Device }
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

const { Navigator, Group, Screen } = createNativeStackNavigator<RootStackParamListHome>()

export const HomeStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="HomeStack" screenOptions={{ headerShown: false, animation }}>
            <Group>
                <Screen name={Routes.HOME} component={HomeScreen} options={{ headerShown: false }} />
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
                <Screen name={Routes.SWAP} component={SwapScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.SETTINGS_CONNECTED_APPS}
                    component={ConnectedAppsScreen}
                    options={{ headerShown: false }}
                />
                <Screen name={Routes.HISTORY} component={HistoryScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.ACTIVITY_DETAILS}
                    component={ActivityDetailsScreen}
                    options={{ headerShown: false }}
                />
                <Screen name={Routes.MANAGE_TOKEN} component={ManageTokenScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.MANAGE_CUSTOM_TOKEN}
                    component={ManageCustomTokenScreen}
                    options={{ headerShown: false }}
                />

                <Screen name={Routes.TOKEN_DETAILS} component={AssetDetailScreen} options={{ headerShown: false }} />
            </Group>

            <Group>
                <Screen
                    name={Routes.WALLET_MANAGEMENT}
                    component={WalletManagementScreen}
                    options={{ headerShown: false }}
                />
                <Screen name={Routes.WALLET_DETAILS} component={WalletDetailScreen} options={{ headerShown: false }} />
            </Group>
        </Navigator>
    )
}
