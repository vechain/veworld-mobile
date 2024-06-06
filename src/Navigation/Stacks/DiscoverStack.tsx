import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { DiscoverScreen, FavouritesScreen, InAppBrowser, BrowserHistoryScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { useNavAnimation } from "~Hooks"

export type RootStackParamListBrowser = {
    [Routes.DISCOVER]: undefined
    [Routes.DISCOVER_FAVOURITES]: undefined
    [Routes.DISCOVER_FEATURED]: undefined
    [Routes.DISCOVER_BROWSER_HISTORY]: undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
    }
}

const { Navigator, Group, Screen } = createNativeStackNavigator<RootStackParamListBrowser>()

export const DiscoverStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="BrowserStack" screenOptions={{ headerShown: false, animation }}>
            <Group>
                <Screen name={Routes.DISCOVER} component={DiscoverScreen} options={{ headerShown: false }} />
                <Screen name={Routes.BROWSER} component={InAppBrowser} options={{ headerShown: false }} />
            </Group>

            <Group
                screenOptions={{
                    presentation: "modal",
                }}>
                <Screen
                    name={Routes.DISCOVER_FAVOURITES}
                    component={FavouritesScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.DISCOVER_BROWSER_HISTORY}
                    component={BrowserHistoryScreen}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
