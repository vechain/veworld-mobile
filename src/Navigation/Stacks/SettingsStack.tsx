import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useFeatureFlags } from "~Components"
import { Device, LocalDevice } from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import {
    AddContactScreen,
    AddCustomNodeScreen,
    ChangeNetworkScreen,
    ChooseBackupDetailsPassword,
    ClaimUsername,
    ConnectedAppsScreen,
    ContactsScreen,
    DetailsBackupScreen,
    GeneralScreen,
    InAppBrowser,
    ManageCustomNodesScreen,
    ManageUrlsScreen,
    NotificationScreen,
    PrivacyScreen,
    ResetAppScreen,
    SettingsScreen,
    SettingsTransactionsScreen,
    TabsManagerScreen,
    UsernameClaimed,
    WalletDetailScreen,
    WalletManagementScreen,
} from "~Screens"
import { AboutScreen } from "~Screens/Flows/App/AboutScreen"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type RootStackParamListSettings = {
    [Routes.SETTINGS]: undefined
    [Routes.SETTINGS_NETWORK]: undefined
    [Routes.SETTINGS_ADD_CUSTOM_NODE]: undefined
    [Routes.SETTINGS_MANAGE_CUSTOM_NODES]: undefined
    [Routes.SETTINGS_PRIVACY]: undefined
    [Routes.SETTINGS_ABOUT]: undefined
    [Routes.SETTINGS_GENERAL]: undefined
    [Routes.SETTINGS_ALERTS]: undefined
    [Routes.SETTINGS_CONTACTS]: undefined
    [Routes.SETTINGS_ADD_CONTACT]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.WALLET_DETAILS]: { device: Device }
    [Routes.SETTINGS_TRANSACTIONS]: undefined
    [Routes.MANAGE_DELEGATION_URLS]: undefined
    [Routes.RESET_APP]: undefined
    [Routes.SETTINGS_CONNECTED_APPS]: undefined
    [Routes.ICLOUD_DETAILS_BACKUP]: { deviceToBackup?: LocalDevice; backupDetails: string[] | string }
    [Routes.CHOOSE_DETAILS_BACKUP_PASSWORD]: { backupDetails: string[] | string; device: LocalDevice }
    [Routes.SETTINGS_NOTIFICATIONS]: undefined
    [Routes.CLAIM_USERNAME]: undefined
    [Routes.USERNAME_CLAIMED]: {
        username: string
    }
    [Routes.DISCOVER_SEARCH]: undefined
    [Routes.DISCOVER_TABS_MANAGER]: undefined
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.APPS_SEARCH]: undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING | Routes.APPS
    }
}

const Settings = createStackNavigator<RootStackParamListSettings>()

export const SettingsStack = () => {
    const { betterWorldFeature } = useFeatureFlags()

    return (
        <Settings.Navigator screenOptions={{ headerShown: false }}>
            <Settings.Screen name={Routes.SETTINGS} component={SettingsScreen} options={{ headerShown: false }} />
            <Settings.Screen
                name={Routes.SETTINGS_NETWORK}
                component={ChangeNetworkScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_ADD_CUSTOM_NODE}
                component={AddCustomNodeScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_MANAGE_CUSTOM_NODES}
                component={ManageCustomNodesScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_PRIVACY}
                component={PrivacyScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen name={Routes.SETTINGS_ABOUT} component={AboutScreen} options={{ headerShown: false }} />

            <Settings.Screen
                name={Routes.WALLET_MANAGEMENT}
                component={WalletManagementScreen}
                options={{ headerShown: false }}
            />
            <Settings.Screen
                name={Routes.WALLET_DETAILS}
                component={WalletDetailScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_GENERAL}
                component={GeneralScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_CONTACTS}
                component={ContactsScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_TRANSACTIONS}
                component={SettingsTransactionsScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.MANAGE_DELEGATION_URLS}
                component={ManageUrlsScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_ADD_CONTACT}
                component={AddContactScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen name={Routes.RESET_APP} component={ResetAppScreen} options={{ headerShown: false }} />

            <Settings.Screen
                name={Routes.SETTINGS_CONNECTED_APPS}
                component={ConnectedAppsScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.ICLOUD_DETAILS_BACKUP}
                component={DetailsBackupScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.CHOOSE_DETAILS_BACKUP_PASSWORD}
                component={ChooseBackupDetailsPassword}
                options={{
                    headerShown: false,
                }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_NOTIFICATIONS}
                component={NotificationScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen name={Routes.CLAIM_USERNAME} component={ClaimUsername} options={{ headerShown: false }} />
            <Settings.Screen
                name={Routes.USERNAME_CLAIMED}
                component={UsernameClaimed}
                options={{ headerShown: false }}
            />
            <Settings.Screen
                name={betterWorldFeature.appsScreen.enabled ? Routes.APPS_TABS_MANAGER : Routes.DISCOVER_TABS_MANAGER}
                component={TabsManagerScreen}
                options={
                    isIOS()
                        ? {
                              headerShown: false,
                              cardStyleInterpolator: slideFadeInTransition,
                              presentation: "modal",
                              transitionSpec: TRANSITION_SPECS,
                              gestureDirection: "vertical",
                          }
                        : {
                              headerShown: false,
                          }
                }
            />
            <Settings.Screen
                name={betterWorldFeature.appsScreen.enabled ? Routes.APPS_SEARCH : Routes.DISCOVER_SEARCH}
                component={AppsSearchScreen}
                options={
                    isIOS()
                        ? {
                              headerShown: false,
                              cardStyleInterpolator: slideFadeInTransition,
                              presentation: "modal",
                              transitionSpec: TRANSITION_SPECS,
                              gestureDirection: "vertical",
                          }
                        : {
                              headerShown: false,
                          }
                }
            />
            <Settings.Screen
                name={Routes.BROWSER}
                component={InAppBrowser}
                options={
                    isIOS()
                        ? {
                              headerShown: false,
                              cardStyleInterpolator: slideFadeInTransition,
                              presentation: "modal",
                              transitionSpec: TRANSITION_SPECS,
                              gestureDirection: "vertical",
                          }
                        : {
                              headerShown: false,
                          }
                }
            />
        </Settings.Navigator>
    )
}
