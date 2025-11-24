import { createStackNavigator } from "@react-navigation/stack"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import React from "react"
import { useFeatureFlags } from "~Components"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import {
    Activity,
    CloudKitWallet,
    ConnectedLedgerDevice,
    Device,
    DrivetWallet,
    FungibleToken,
    FungibleTokenWithBalance,
    LedgerAccountWithDevice,
    TransactionOutcomes,
} from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import {
    ActivityDetailsScreen,
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
    SendScreen,
} from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { AssetDetailScreenSheet } from "~Screens/Flows/App/AssetDetailScreenSheet"
import { BalanceScreen } from "~Screens/Flows/App/BalanceScreen/BalanceScreen"
import { CollectionsScreen, SendCollectibleRecapScreen } from "~Screens/Flows/App/Collectibles"
import { BlacklistedCollectionsScreen } from "~Screens/Flows/App/Collectibles/BlacklistedCollectionsScreen"
import { CollectibleCollectionDetails } from "~Screens/Flows/App/Collectibles/CollectibleCollectionDetails"
import { ReportNFTTransactionScreen } from "~Screens/Flows/App/NFT/NFTReportCollection/ReportNFTTransactionScreen"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { BuyStack } from "./BuyStack"
import { COLORS, SCREEN_HEIGHT } from "~Constants"

type NavigationMetadata<RouteName extends keyof RootStackParamListHome> = {
    route: RouteName
    params: RootStackParamListHome[RouteName]
    screen?: Routes
}

export type RootStackParamListHome = {
    [Routes.HOME]: undefined
    [Routes.SEND_TOKEN]: undefined
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
    [Routes.HISTORY]:
        | {
              screen?:
                  | Routes.ACTIVITY_ALL
                  | Routes.ACTIVITY_B3TR
                  | Routes.ACTIVITY_TRANSFER
                  | Routes.ACTIVITY_STAKING
                  | Routes.ACTIVITY_SWAP
                  | Routes.ACTIVITY_NFT
                  | Routes.ACTIVITY_DAPPS
                  | Routes.ACTIVITY_OTHER
          }
        | undefined
    [Routes.MANAGE_TOKEN]: undefined
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
        returnScreen?:
            | Routes.SETTINGS
            | Routes.HOME
            | Routes.ACTIVITY_STAKING
            | Routes.APPS
            | Routes.SWAP
            | Routes.COLLECTIBLES_COLLECTION_DETAILS
    }
    [Routes.SETTINGS_NETWORK]: undefined
    [Routes.SETTINGS_ADD_CUSTOM_NODE]: undefined
    [Routes.SETTINGS_MANAGE_CUSTOM_NODES]: undefined
    [Routes.CLAIM_USERNAME]: undefined
    [Routes.USERNAME_CLAIMED]: {
        username: string
    }
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.APPS_SEARCH]: undefined
    [Routes.ACTIVITY_DETAILS]: {
        activity: Activity
        token?: FungibleToken
        isSwap?: boolean
        decodedClauses?: TransactionOutcomes
        returnScreen?: Routes.HOME | Routes.HISTORY
    }
    [Routes.BUY_FLOW]: undefined
    [Routes.COLLECTIBLES_COLLECTIONS]: undefined
    [Routes.COLLECTIBLES_COLLECTION_DETAILS]: {
        collectionAddress: string
    }
    [Routes.REPORT_NFT_TRANSACTION_SCREEN]: {
        nftAddress: string
        transactionClauses: TransactionClause[]
    }
    [Routes.SEND_NFT_RECAP]: {
        contractAddress: string
        tokenId: string
        receiverAddress: string
    }
    [Routes.BLACKLISTED_COLLECTIONS]: undefined
}

const { Navigator, Group, Screen } = createStackNavigator<RootStackParamListHome>()

export const HomeStack = () => {
    const { betterWorldFeature } = useFeatureFlags()
    const theme = useTheme()

    return (
        <Navigator id="HomeStack" screenOptions={{ headerShown: false, animationEnabled: isIOS() }}>
            <Group>
                <Screen
                    name={Routes.HOME}
                    component={betterWorldFeature.balanceScreen?.enabled ? BalanceScreen : HomeScreen}
                    options={{ headerShown: false }}
                />
                <Screen name={Routes.SEND_TOKEN} component={SendScreen} options={{ headerShown: false }} />
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

                {betterWorldFeature?.balanceScreen?.tokens?.enabled ? (
                    <Screen
                        name={Routes.TOKEN_DETAILS}
                        component={AssetDetailScreenSheet}
                        options={{
                            headerShown: false,
                            presentation: "transparentModal",
                            gestureDirection: "vertical",
                            gestureEnabled: true,
                            gestureResponseDistance: SCREEN_HEIGHT,
                        }}
                    />
                ) : (
                    <Screen
                        name={Routes.TOKEN_DETAILS}
                        component={AssetDetailScreen}
                        options={{ headerShown: false }}
                    />
                )}

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
                <Screen
                    name={Routes.BROWSER}
                    component={InAppBrowser}
                    options={{
                        headerShown: false,
                        cardStyleInterpolator: slideFadeInTransition,
                        presentation: "modal",
                        transitionSpec: TRANSITION_SPECS,
                        gestureDirection: "vertical",
                        gestureEnabled: true,
                    }}
                />
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
                    name={Routes.APPS_TABS_MANAGER}
                    component={TabsManagerScreen}
                    options={{
                        headerShown: false,
                        cardStyleInterpolator: slideFadeInTransition,
                        presentation: "modal",
                        transitionSpec: TRANSITION_SPECS,
                        gestureDirection: "vertical",
                        gestureEnabled: true,
                    }}
                />
                <Screen
                    name={Routes.APPS_SEARCH}
                    component={AppsSearchScreen}
                    options={{
                        headerShown: false,
                        cardStyleInterpolator: slideFadeInTransition,
                        presentation: "modal",
                        transitionSpec: TRANSITION_SPECS,
                        gestureDirection: "vertical",
                        gestureEnabled: true,
                    }}
                />
                <Screen
                    name={Routes.ACTIVITY_DETAILS}
                    component={ActivityDetailsScreen}
                    options={{ headerShown: false }}
                />
                <Screen
                    name={Routes.BUY_FLOW}
                    component={BuyStack}
                    options={{
                        presentation: "modal",
                        cardStyle: {
                            paddingTop: 16,
                            borderRadius: 24,
                            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
                        },
                    }}
                />
                {betterWorldFeature.balanceScreen.collectibles.enabled && (
                    <Screen
                        name={Routes.COLLECTIBLES_COLLECTIONS}
                        component={CollectionsScreen}
                        options={{ headerShown: false }}
                    />
                )}
                {betterWorldFeature.balanceScreen.collectibles.enabled && (
                    <Screen
                        name={Routes.COLLECTIBLES_COLLECTION_DETAILS}
                        component={CollectibleCollectionDetails}
                        options={{ headerShown: false }}
                    />
                )}
                {betterWorldFeature.balanceScreen.collectibles.enabled && (
                    <Screen
                        name={Routes.REPORT_NFT_TRANSACTION_SCREEN}
                        component={ReportNFTTransactionScreen}
                        options={{ headerShown: false }}
                    />
                )}
                {betterWorldFeature.balanceScreen.collectibles.enabled && (
                    <Screen
                        name={Routes.SEND_NFT_RECAP}
                        component={SendCollectibleRecapScreen}
                        options={{ headerShown: false }}
                    />
                )}
                {betterWorldFeature.balanceScreen.collectibles.enabled && (
                    <Screen
                        name={Routes.BLACKLISTED_COLLECTIONS}
                        component={BlacklistedCollectionsScreen}
                        options={{
                            presentation: "modal",
                        }}
                    />
                )}
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
