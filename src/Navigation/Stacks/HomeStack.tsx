import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { Transaction } from "thor-devkit"
import { TokenWithCompleteInfo, useNavAnimation } from "~Hooks"
import {
    CloudKitWallet,
    ConnectedLedgerDevice,
    Device,
    DrivetWallet,
    FungibleTokenWithBalance,
    LedgerAccountWithDevice,
} from "~Model"
import { Routes } from "~Navigation/Enums"
import {
    AssetDetailScreen,
    ChangeNetworkScreen,
    ConnectedAppsScreen,
    EnableAdditionalSettings,
    HomeScreen,
    ImportFromCloudScreen,
    ImportLocalWallet,
    ImportMnemonicBackupPasswordScreen,
    InAppBrowser,
    InsertAddressSendScreen,
    LedgerSignTransaction,
    ManageCustomTokenScreen,
    ManageTokenScreen,
    ObserveWalletScreen,
    SelectAmountSendScreen,
    SelectLedgerAccounts,
    SelectLedgerDevice,
    SelectTokenSendScreen,
    SwapScreen,
    TransactionSummarySendScreen,
    WalletDetailScreen,
    WalletManagementScreen,
    ClaimUsername,
    UsernameClaimed,
} from "~Screens"

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
    [Routes.TOKEN_DETAILS]: { token: TokenWithCompleteInfo }
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
    }
    [Routes.SETTINGS_NETWORK]: undefined
    [Routes.CLAIM_USERNAME]: undefined
    [Routes.USERNAME_CLAIMED]: {
        username: string
    }
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
