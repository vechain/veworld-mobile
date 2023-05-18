import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    ConfirmMnemonicScreen,
    ImportMnemonicScreen,
    ImportWalletTypeSelectionScreen,
    NewMnemonicScreen,
    UserCreatePasswordScreen,
    WalletSuccessScreen,
    WalletTypeSelectionScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { SecurityLevelType } from "~Model"

export type RootStackParamListCreateWalletApp = {
    Home: undefined
    [Routes.WALLET_SETUP]: undefined
    [Routes.NEW_MNEMONIC]: undefined
    [Routes.CONFIRM_MNEMONIC]: undefined
    [Routes.WALLET_TYPE_IMPORT]: undefined
    [Routes.IMPORT_MNEMONIC]: undefined
    [Routes.WALLET_SUCCESS]:
        | {
              securityLevelSelected?: SecurityLevelType
              userPin?: string
          }
        | undefined
    [Routes.USER_CREATE_PASSWORD]: undefined
}

const CreateWalletApp =
    createNativeStackNavigator<RootStackParamListCreateWalletApp>()

export const CreateWalletAppStack = () => {
    return (
        <CreateWalletApp.Navigator screenOptions={{ headerShown: false }}>
            <CreateWalletApp.Screen
                name={Routes.WALLET_SETUP}
                component={WalletTypeSelectionScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.WALLET_TYPE_IMPORT}
                component={ImportWalletTypeSelectionScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.NEW_MNEMONIC}
                component={NewMnemonicScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.CONFIRM_MNEMONIC}
                component={ConfirmMnemonicScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.WALLET_SUCCESS}
                component={WalletSuccessScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.IMPORT_MNEMONIC}
                component={ImportMnemonicScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.USER_CREATE_PASSWORD}
                component={UserCreatePasswordScreen}
                options={{ headerShown: false }}
            />
        </CreateWalletApp.Navigator>
    )
}
