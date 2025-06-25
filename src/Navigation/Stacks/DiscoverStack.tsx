import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { useNavAnimation } from "~Hooks"
import { Routes } from "~Navigation/Enums"
import { DiscoverScreen, FavouritesScreen, InAppBrowser, SearchScreen, TabsManagerScreen } from "~Screens"

export type RootStackParamListBrowser = {
    [Routes.DISCOVER]: undefined
    [Routes.DISCOVER_FAVOURITES]: undefined
    [Routes.DISCOVER_FEATURED]: undefined
    [Routes.DISCOVER_SEARCH]: undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.ACTIVITY_STAKING
    }
    [Routes.DISCOVER_TABS_MANAGER]: undefined
    [Routes.ACTIVITY_STAKING]: undefined
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

            <Screen name={Routes.DISCOVER_FAVOURITES} component={FavouritesScreen} options={{ headerShown: false }} />
            <Screen name={Routes.DISCOVER_SEARCH} component={SearchScreen} options={{ headerShown: false }} />
            <Screen
                name={Routes.DISCOVER_TABS_MANAGER}
                component={TabsManagerScreen}
                options={{ headerShown: false }}
            />
        </Navigator>
    )
}
