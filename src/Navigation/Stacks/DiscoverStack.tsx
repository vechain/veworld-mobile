import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { DiscoverScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { useNavAnimation } from "~Hooks"

export type RootStackParamListBrowser = {
    [Routes.DISCOVER]: undefined
    [Routes.DISCOVER_FAVOURITES]: undefined
    [Routes.DISCOVER_FEATURED]: undefined
}

const { Navigator, Group, Screen } = createNativeStackNavigator<RootStackParamListBrowser>()

export const DiscoverStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="BrowserStack" screenOptions={{ headerShown: false, animation }}>
            <Group>
                <Screen name={Routes.DISCOVER} component={DiscoverScreen} options={{ headerShown: false }} />
            </Group>
        </Navigator>
    )
}
