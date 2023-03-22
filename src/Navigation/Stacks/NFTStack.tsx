import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NFTScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListHome = {
    [Routes.NFTS]: undefined
}

const { Navigator, Group, Screen } =
    createNativeStackNavigator<RootStackParamListHome>()

export const NFTStack = () => {
    return (
        <Navigator>
            <Group>
                <Screen
                    name={Routes.NFTS}
                    component={NFTScreen}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
