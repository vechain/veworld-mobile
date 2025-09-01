import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import { DiscoverScreen, FavouritesScreen, InAppBrowser, TabsManagerScreen } from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type RootStackParamListBrowser = {
    [Routes.DISCOVER]: undefined
    [Routes.DISCOVER_FAVOURITES]: undefined
    [Routes.DISCOVER_FEATURED]: undefined
    [Routes.DISCOVER_SEARCH]: undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING | Routes.APPS
    }
    [Routes.DISCOVER_TABS_MANAGER]: undefined
    [Routes.ACTIVITY_STAKING]: undefined
}

const { Navigator, Group, Screen } = createStackNavigator<RootStackParamListBrowser>()

export const DiscoverStack = () => {
    return (
        <Navigator id="BrowserStack" screenOptions={{ headerShown: false }}>
            <Group>
                <Screen name={Routes.DISCOVER} component={DiscoverScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.BROWSER}
                    component={InAppBrowser}
                    options={
                        isIOS()
                            ? {
                                  headerShown: false,
                                  cardStyleInterpolator: slideFadeInTransition,
                                  presentation: "modal",
                                  transitionSpec: TRANSITION_SPECS,
                                  gestureDirection: "vertical",
                              }
                            : {
                                  headerShown: false,
                              }
                    }
                />
            </Group>

            <Screen name={Routes.DISCOVER_FAVOURITES} component={FavouritesScreen} options={{ headerShown: false }} />
            <Screen
                name={Routes.DISCOVER_SEARCH}
                component={AppsSearchScreen}
                options={
                    isIOS()
                        ? {
                              headerShown: false,
                              cardStyleInterpolator: slideFadeInTransition,
                              presentation: "modal",
                              transitionSpec: TRANSITION_SPECS,
                              gestureDirection: "vertical",
                          }
                        : {
                              headerShown: false,
                          }
                }
            />
            <Screen
                name={Routes.DISCOVER_TABS_MANAGER}
                component={TabsManagerScreen}
                options={
                    isIOS()
                        ? {
                              headerShown: false,
                              cardStyleInterpolator: slideFadeInTransition,
                              presentation: "modal",
                              transitionSpec: TRANSITION_SPECS,
                              gestureDirection: "vertical",
                          }
                        : {
                              headerShown: false,
                          }
                }
            />
        </Navigator>
    )
}
