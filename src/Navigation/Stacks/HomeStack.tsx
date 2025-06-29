import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import React from "react"
import { TokenWithCompleteInfo, useNavAnimation } from "~Hooks"
import {
    CloudKitWallet,
    ConnectedLedgerDevice,
    Device,
    DrivetWallet,
    FungibleToken,
    FungibleTokenWithBalance,
    LedgerAccountWithDevice,
} from "~Model"
import { Routes } from "~Navigation/Enums"
import {
    AddCustomNodeScreen,
    AssetDetailScreen,
    BridgeAssetDetailScreen,
    ChangeNetworkScreen,
    ClaimUsername,
    ConnectedAppsScreen,
    ConvertTransactionScreen,
    EnableAdditionalSettings,
    HomeScreen,
    ImportFromCloudScreen,
    ImportLocalWallet,
    ImportMnemonicBackupPasswordScreen,
    InAppBrowser,
    InsertAddressSendScreen,
    LedgerSignTransaction,
    ManageCustomNodesScreen,
    ManageCustomTokenScreen,
    ManageTokenScreen,
    ObserveWalletScreen,
    SelectAmountSendScreen,
    SelectLedgerAccounts,
    SelectLedgerDevice,
    SelectTokenSendScreen,
    SwapScreen,
    TabsManagerScreen,
    TransactionSummarySendScreen,
    UsernameClaimed,
    WalletDetailScreen,
    WalletManagementScreen,
} from "~Screens"

type NavigationMetadata<RouteName extends keyof RootStackParamListHome> = {
    route: RouteName
    params: RootStackParamListHome[RouteName]
    screen?: Routes
}

export type RootStackParamListHome = {
    [Routes.HOME]: undefined
    [Routes.SELECT_TOKEN_SEND]: undefined
    [Routes.SELECT_AMOUNT_SEND]: {
        token: FungibleTokenWithBalance
        address: string
    }
    [Routes.INSERT_ADDRESS_SEND]: {
        token?: FungibleTokenWithBalance
        contractAddress?: string
        tokenId?: string
    }
    [Routes.TRANSACTION_SUMMARY_SEND]: {
        token: FungibleTokenWithBalance
        amount: string
        address: string
        navigation?: NavigationMetadata<any>
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
    [Routes.TOKEN_DETAILS]: {
        token: TokenWithCompleteInfo
        /**
         * Provided when user convert B3TR/VOT3 token to display bottom sheet result
         */
        betterConversionResult?: {
            from?: FungibleToken
            to?: FungibleToken
            amount: string
            txId: string
        }
    }
    [Routes.BRIDGE_TOKEN_DETAILS]: {
        token: FungibleTokenWithBalance
    }
    [Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN]: {
        token: TokenWithCompleteInfo
        amount: string
        transactionClauses: TransactionClause[]
    }
    [Routes.SETTINGS_CONNECTED_APPS]: undefined
    [Routes.OBSERVE_WALLET]: undefined
    [Routes.IMPORT_MNEMONIC]: undefined
    [Routes.IMPORT_HW_LEDGER_SELECT_DEVICE]: undefined
    [Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS]: {
        device: ConnectedLedgerDevice
    }
    [Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS]: {
        device: ConnectedLedgerDevice
    }
    [Routes.IMPORT_FROM_CLOUD]: {
        wallets: CloudKitWallet[] | DrivetWallet[]
    }
    [Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD]: {
        wallet: CloudKitWallet | DrivetWallet
    }
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING
    }
    [Routes.SETTINGS_NETWORK]: undefined
    [Routes.SETTINGS_ADD_CUSTOM_NODE]: undefined
    [Routes.SETTINGS_MANAGE_CUSTOM_NODES]: undefined
    [Routes.CLAIM_USERNAME]: undefined
    [Routes.USERNAME_CLAIMED]: {
        username: string
    }
    [Routes.DISCOVER_TABS_MANAGER]: undefined
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
                <Screen name={Routes.MANAGE_TOKEN} component={ManageTokenScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.MANAGE_CUSTOM_TOKEN}
                    component={ManageCustomTokenScreen}
                    options={{ headerShown: false }}
                />

                <Screen name={Routes.TOKEN_DETAILS} component={AssetDetailScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.BRIDGE_TOKEN_DETAILS}
                    component={BridgeAssetDetailScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN}
                    component={ConvertTransactionScreen}
                    options={{ headerShown: false }}
                />
                <Screen name={Routes.OBSERVE_WALLET} component={ObserveWalletScreen} options={{ headerShown: false }} />
                <Screen name={Routes.IMPORT_MNEMONIC} component={ImportLocalWallet} options={{ headerShown: false }} />

                <Screen
                    name={Routes.IMPORT_HW_LEDGER_SELECT_DEVICE}
                    component={SelectLedgerDevice}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS}
                    component={EnableAdditionalSettings}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS}
                    component={SelectLedgerAccounts}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.IMPORT_FROM_CLOUD}
                    component={ImportFromCloudScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD}
                    component={ImportMnemonicBackupPasswordScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Screen name={Routes.BROWSER} component={InAppBrowser} options={{ headerShown: false }} />
                <Screen
                    name={Routes.SETTINGS_NETWORK}
                    component={ChangeNetworkScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.SETTINGS_ADD_CUSTOM_NODE}
                    component={AddCustomNodeScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.SETTINGS_MANAGE_CUSTOM_NODES}
                    component={ManageCustomNodesScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.DISCOVER_TABS_MANAGER}
                    component={TabsManagerScreen}
                    options={{ headerShown: false }}
                />
            </Group>

            <Group>
                <Screen
                    name={Routes.WALLET_MANAGEMENT}
                    component={WalletManagementScreen}
                    options={{ headerShown: false }}
                />
                <Screen name={Routes.WALLET_DETAILS} component={WalletDetailScreen} options={{ headerShown: false }} />
            </Group>
            <Group>
                <Screen name={Routes.CLAIM_USERNAME} component={ClaimUsername} options={{ headerShown: false }} />
                <Screen name={Routes.USERNAME_CLAIMED} component={UsernameClaimed} options={{ headerShown: false }} />
            </Group>
        </Navigator>
    )
}
