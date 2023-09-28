import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    AssetDetailScreen,
    BuyScreen,
    DiscoverScreen,
    LedgerSignTransaction,
    SelectAmountSendScreen,
    SelectTokenSendScreen,
    SwapScreen,
    TransactionSummarySendScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import {
    FungibleTokenWithBalance,
    LedgerAccountWithDevice,
    TokenWithCompleteInfo,
} from "~Model"
import { Transaction } from "thor-devkit"
import { useNavAnimation } from "~Hooks"

export type RootStackParamListDiscover = {
    [Routes.DISCOVER]: undefined
    [Routes.TOKEN_DETAILS]: { token: TokenWithCompleteInfo }
    [Routes.BUY]: undefined
    [Routes.SWAP]: undefined
    [Routes.SELECT_TOKEN_SEND]: { initialRoute: Routes }
    [Routes.SELECT_AMOUNT_SEND]: {
        token: FungibleTokenWithBalance
        initialRoute: Routes
    }
    [Routes.TRANSACTION_SUMMARY_SEND]: {
        token: FungibleTokenWithBalance
        amount: string
        address: string
        initialRoute: Routes
    }
    [Routes.LEDGER_SIGN_TRANSACTION]: {
        accountWithDevice: LedgerAccountWithDevice
        delegationSignature?: string
        transaction: Transaction
        initialRoute: Routes
    }
}

const { Navigator, Group, Screen } =
    createNativeStackNavigator<RootStackParamListDiscover>()

export const DiscoverStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator screenOptions={{ headerShown: false, animation }}>
            <Group>
                <Screen
                    name={Routes.DISCOVER}
                    component={DiscoverScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.TOKEN_DETAILS}
                    component={AssetDetailScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.BUY}
                    component={BuyScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.SWAP}
                    component={SwapScreen}
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
                    name={Routes.TRANSACTION_SUMMARY_SEND}
                    component={TransactionSummarySendScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.LEDGER_SIGN_TRANSACTION}
                    component={LedgerSignTransaction}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
