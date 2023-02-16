import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    ConfirmSeedPhraseScreen,
    ImportSeedPhraseScreen,
    ImportWalletTypeSelectionScreen,
    SeedPhraseScreen,
    TutorialScreen,
    UserCreatePasswordScreen,
    WalletSuccessScreen,
    WalletTypeSelectionScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"
import { SecurityLevelType } from "~Model"

export type RootStackParamListCreateWalletApp = {
    Home: undefined
    [Routes.SEED_PHRASE]: undefined
    [Routes.WALLET_TPYE_CREATION]: undefined
    [Routes.WALLET_TPYE_IMPORT]: undefined
    [Routes.WALLET_TUTORIAL]: undefined
    [Routes.CONFIRM_SEED_PHRASE]: undefined
    [Routes.IMPORT_SEED_PHRASE]: undefined
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
                name={Routes.WALLET_TPYE_CREATION}
                component={WalletTypeSelectionScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.WALLET_TPYE_IMPORT}
                component={ImportWalletTypeSelectionScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.WALLET_TUTORIAL}
                component={TutorialScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.SEED_PHRASE}
                component={SeedPhraseScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.CONFIRM_SEED_PHRASE}
                component={ConfirmSeedPhraseScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.WALLET_SUCCESS}
                component={WalletSuccessScreen}
                options={{ headerShown: false }}
            />

            <CreateWalletApp.Screen
                name={Routes.IMPORT_SEED_PHRASE}
                component={ImportSeedPhraseScreen}
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
