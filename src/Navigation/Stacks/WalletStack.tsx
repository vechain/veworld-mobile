import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    SeedPhraseScreen,
    TutorialScreen,
    WalletTypeSelectionScreen,
    ConfirmSeedPhraseScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListWallet = {
    Wallet_Tutorial: undefined
    Wallet_Type_Creation: undefined
    Seed_Phrase: undefined
    Confirm_Seed_Phrase: undefined
}

const Wallet = createNativeStackNavigator<RootStackParamListWallet>()

export const WalletStack = () => {
    return (
        <Wallet.Navigator screenOptions={{ headerShown: false }}>
            <Wallet.Group>
                <Wallet.Screen
                    name={Routes.WALLET_TPYE_CREATION}
                    component={WalletTypeSelectionScreen}
                    options={{ headerShown: false }}
                />

                <Wallet.Screen
                    name={Routes.WALLET_TUTORIAL}
                    component={TutorialScreen}
                    options={{ headerShown: false }}
                />

                <Wallet.Screen
                    name={Routes.SEED_PHRASE}
                    component={SeedPhraseScreen}
                    options={{ headerShown: false }}
                />

                <Wallet.Screen
                    name={Routes.CONFIRM_SEED_PHRASE}
                    component={ConfirmSeedPhraseScreen}
                    options={{ headerShown: false }}
                />
            </Wallet.Group>

            {/* <Wallet.Group
                screenOptions={{
                    presentation: "fullScreenModal",

            </Wallet.Group> */}
        </Wallet.Navigator>
    )
}
