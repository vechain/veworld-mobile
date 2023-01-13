import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { HomeScreen } from "~Screens"

export type RootStackParamListHome = {
    Home: undefined
}

const Home = createNativeStackNavigator<RootStackParamListHome>()

export const HomeStack = () => {
    return (
        <Home.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Home.Group>
                <Home.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
            </Home.Group>
        </Home.Navigator>
    )
}
