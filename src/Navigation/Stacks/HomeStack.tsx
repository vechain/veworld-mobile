import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { CameraScreen, HomeScreen, WalletManagementScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { CreateWalletAppStack } from "./CreateWalletAppStack"

export type RootStackParamListHome = {
    [Routes.HOME]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
    [Routes.CAMERA]: { showSendFlow: boolean }
}

const Home = createNativeStackNavigator<RootStackParamListHome>()

export const HomeStack = () => {
    return (
        <Home.Navigator screenOptions={{ headerShown: false }}>
            <Home.Group>
                <Home.Screen
                    name={Routes.HOME}
                    component={HomeScreen}
                    options={{
                        headerShown: false,
                    }}
                />
            </Home.Group>

            <Home.Group>
                <Home.Screen
                    name={Routes.WALLET_MANAGEMENT}
                    component={WalletManagementScreen}
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

                <Home.Screen
                    name={Routes.CAMERA}
                    component={CameraScreen}
                    options={{ headerShown: false }}
                />
            </Home.Group>
        </Home.Navigator>
    )
}
