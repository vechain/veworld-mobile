import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { InAppBrowser } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { useNavAnimation } from "~Hooks"

export type RootStackParamListBrowser = {
    [Routes.BROWSER]: undefined
}

const { Navigator, Group, Screen } =
    createNativeStackNavigator<RootStackParamListBrowser>()

export const DiscoverStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator
            id="BrowserStack"
            screenOptions={{ headerShown: false, animation }}>
            <Group>
                <Screen
                    name={Routes.BROWSER}
                    component={InAppBrowser}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
