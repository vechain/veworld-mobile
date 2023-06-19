import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    AddContactScreen,
    AdvancedScreen,
    ChangeNetworkScreen,
    ContactsScreen,
    AddCustomNodeScreen,
    GeneralScreen,
    PrivacyScreen,
    SettingsScreen,
    WalletManagementScreen,
    ManageCustomNodesScreen,
    SettingsTransactionsScreen,
    ManageUrlsScreen,
    ResetAppScreen,
    ConnectedAppsScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListSettings = {
    [Routes.SETTINGS]: undefined
    [Routes.SETTINGS_NETWORK]: undefined
    [Routes.SETTINGS_ADD_CUSTOM_NODE]: undefined
    [Routes.SETTINGS_MANAGE_CUSTOM_NODES]: undefined
    [Routes.SETTINGS_PRIVACY]: undefined
    [Routes.SETTINGS_ADVANCED]: undefined
    [Routes.SETTINGS_GENERAL]: undefined
    [Routes.SETTINGS_CONTACTS]: undefined
    [Routes.SETTINGS_ADD_CONTACT]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.SETTINGS_TRANSACTIONS]: undefined
    [Routes.MANAGE_DELEGATION_URLS]: undefined
    [Routes.RESET_APP]: undefined
    [Routes.SETTINGS_CONNECTED_APPS]: undefined
}

const Settings = createNativeStackNavigator<RootStackParamListSettings>()

export const SettingsStack = () => {
    return (
        <Settings.Navigator screenOptions={{ headerShown: false }}>
            <Settings.Group>
                <Settings.Screen
                    name={Routes.SETTINGS}
                    component={SettingsScreen}
                    options={{ headerShown: false }}
                />
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

                <Settings.Screen
                    name={Routes.SETTINGS_ADVANCED}
                    component={AdvancedScreen}
                    options={{ headerShown: false }}
                />
                <Settings.Screen
                    name={Routes.WALLET_MANAGEMENT}
                    component={WalletManagementScreen}
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

                <Settings.Screen
                    name={Routes.RESET_APP}
                    component={ResetAppScreen}
                    options={{ headerShown: false }}
                />

                <Settings.Screen
                    name={Routes.SETTINGS_CONNECTED_APPS}
                    component={ConnectedAppsScreen}
                    options={{ headerShown: false }}
                />
            </Settings.Group>
        </Settings.Navigator>
    )
}
