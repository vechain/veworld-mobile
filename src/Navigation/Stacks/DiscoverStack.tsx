import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { AssetDetailScreen, DiscoverScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { TokenWithCompleteInfo } from "~Model"

export type RootStackParamListDiscover = {
    [Routes.DISCOVER]: undefined
    [Routes.TOKEN_DETAILS]: { token: TokenWithCompleteInfo }
}

const { Navigator, Group, Screen } =
    createNativeStackNavigator<RootStackParamListDiscover>()

export const DiscoverStack = () => {
    return (
        <Navigator>
            <Group>
                <Screen
                    name={Routes.DISCOVER}
                    component={DiscoverScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.TOKEN_DETAILS}
                    component={AssetDetailScreen}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
