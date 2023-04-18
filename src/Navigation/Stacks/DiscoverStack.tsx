import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { DiscoverScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListDiscover = {
    [Routes.DISCOVER]: undefined
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
            </Group>
        </Navigator>
    )
}
