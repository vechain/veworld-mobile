import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { HomeScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { CreateWalletAppStack } from "./CreateWalletAppStack"

export type RootStackParamListHome = {
    Home: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
}

const Home = createNativeStackNavigator<RootStackParamListHome>()

export const HomeStack = () => {
    return (
        <Home.Navigator screenOptions={{ headerShown: false }}>
            <Home.Group>
                <Home.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        headerShown: false,
                    }}
                />
            </Home.Group>

            <Home.Group
                screenOptions={{
                    presentation: "fullScreenModal",
                }}>
                <Home.Screen
                    name={Routes.CREATE_WALLET_FLOW}
                    component={CreateWalletAppStack}
                    options={{ headerShown: false }}
                />
            </Home.Group>
        </Home.Navigator>
    )
}
