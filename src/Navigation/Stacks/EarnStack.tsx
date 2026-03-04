import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import {
    Activity,
    CloudKitWallet,
    ConnectedLedgerDevice,
    Device,
    DriveWallet,
    FungibleToken,
    TransactionOutcomes,
} from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import {
    ActivityDetailsScreen,
    ChangeNetworkScreen,
    ClaimUsername,
    EnableAdditionalSettings,
    ImportFromCloudScreen,
    ImportLocalWallet,
    ImportMnemonicBackupPasswordScreen,
    InAppBrowser,
    ObserveWalletScreen,
    PrivacyScreen,
    SelectLedgerAccounts,
    SelectLedgerDevice,
    TabsManagerScreen,
    UsernameClaimed,
    WalletDetailScreen,
    WalletManagementScreen,
} from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { BalanceScreen } from "~Screens/Flows/App/BalanceScreen/BalanceScreen"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type RootStackParamListEarn = {
    [Routes.EARN]: undefined
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
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.WALLET_DETAILS]: { device: Device }
    [Routes.CREATE_WALLET_FLOW]: undefined
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
        wallets: CloudKitWallet[] | DriveWallet[]
    }
    [Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD]: {
        wallet: CloudKitWallet | DriveWallet
    }
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?:
            | Routes.SETTINGS
            | Routes.HOME
            | Routes.EARN
            | Routes.WALLET
            | Routes.ACTIVITY_STAKING
            | Routes.APPS
            | Routes.SWAP
            | Routes.COLLECTIBLES_COLLECTION_DETAILS
    }
    [Routes.SETTINGS_NETWORK]: undefined
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
        returnScreen?: Routes.HOME | Routes.HISTORY | Routes.WALLET | Routes.EARN
    }
    [Routes.SETTINGS_PRIVACY]: undefined
}

const { Navigator, Group, Screen } = createStackNavigator<RootStackParamListEarn>()

export const EarnStack = () => {
    return (
        <Navigator id="EarnStack" screenOptions={{ headerShown: false, animationEnabled: isIOS() }}>
            <Group>
                <Screen name={Routes.EARN} component={BalanceScreen} options={{ headerShown: false }} />

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

            <Screen name={Routes.SETTINGS_PRIVACY} component={PrivacyScreen} options={{ headerShown: false }} />
        </Navigator>
    )
}
