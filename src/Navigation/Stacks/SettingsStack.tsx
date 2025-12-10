import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { Device, LocalDevice } from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import {
    AddContactScreen,
    ChangeNetworkScreen,
    ChooseBackupDetailsPassword,
    ClaimUsername,
    ConnectedAppsScreen,
    ContactsScreen,
    DetailsBackupScreen,
    GeneralScreen,
    InAppBrowser,
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
import { DeveloperSettingsScreen } from "~Screens/Flows/App/DeveloperSettingsScreen"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type RootStackParamListSettings = {
    [Routes.SETTINGS]: undefined
    [Routes.SETTINGS_NETWORK]: undefined
    [Routes.SETTINGS_PRIVACY]: undefined
    [Routes.SETTINGS_ABOUT]: undefined
    [Routes.SETTINGS_GENERAL]: undefined
    [Routes.SETTINGS_ALERTS]: undefined
    [Routes.SETTINGS_DEVELOPER]: undefined
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
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.APPS_SEARCH]: undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?:
            | Routes.SWAP
            | Routes.SETTINGS
            | Routes.HOME
            | Routes.ACTIVITY_STAKING
            | Routes.APPS
            | Routes.COLLECTIBLES_COLLECTION_DETAILS
    }
}

const Settings = createStackNavigator<RootStackParamListSettings>()

export const SettingsStack = () => {
    return (
        <Settings.Navigator screenOptions={{ headerShown: false, animationEnabled: isIOS() }}>
            <Settings.Screen name={Routes.SETTINGS} component={SettingsScreen} options={{ headerShown: false }} />
            <Settings.Screen
                name={Routes.SETTINGS_NETWORK}
                component={ChangeNetworkScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_PRIVACY}
                component={PrivacyScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen name={Routes.SETTINGS_ABOUT} component={AboutScreen} options={{ headerShown: false }} />

            <Settings.Screen
                name={Routes.SETTINGS_DEVELOPER}
                component={DeveloperSettingsScreen}
                options={{ headerShown: false }}
            />

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
                name={Routes.APPS_TABS_MANAGER}
                component={TabsManagerScreen}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                }}
            />
            <Settings.Screen
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
            <Settings.Screen
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
        </Settings.Navigator>
    )
}
