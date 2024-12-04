import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    AddContactScreen,
    AddCustomNodeScreen,
    ChangeNetworkScreen,
    ConnectedAppsScreen,
    ContactsScreen,
    GeneralScreen,
    ManageCustomNodesScreen,
    ManageUrlsScreen,
    PrivacyScreen,
    ResetAppScreen,
    SettingsScreen,
    SettingsTransactionsScreen,
    WalletManagementScreen,
    WalletDetailScreen,
    MnemonicBackupScreen,
    ChooseMnemonicBackupPassword,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { AboutScreen } from "~Screens/Flows/App/AboutScreen"
import { useNavAnimation } from "~Hooks"
import { Device, LocalDevice } from "~Model"
import { SettingsBrowserView } from "~Screens/Flows/App/SettingsScreen/Components/SettingsBrowserView"

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
    [Routes.ICLOUD_MNEMONIC_BACKUP]: { deviceToBackup?: LocalDevice; mnemonicArray: string[] }
    [Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD]: { mnemonicArray: string[]; device: LocalDevice }
    [Routes.SETTINGS_GET_SUPPORT]: { url: string }
    [Routes.SETTINGS_GIVE_FEEDBACK]: { url: string }
}

const Settings = createNativeStackNavigator<RootStackParamListSettings>()

export const SettingsStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Settings.Navigator screenOptions={{ headerShown: false, animation }}>
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
                name={Routes.ICLOUD_MNEMONIC_BACKUP}
                component={MnemonicBackupScreen}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD}
                component={ChooseMnemonicBackupPassword}
                options={{
                    headerShown: false,
                }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_GET_SUPPORT}
                component={SettingsBrowserView}
                options={{ headerShown: false }}
            />

            <Settings.Screen
                name={Routes.SETTINGS_GIVE_FEEDBACK}
                component={SettingsBrowserView}
                options={{ headerShown: false }}
            />
        </Settings.Navigator>
    )
}
