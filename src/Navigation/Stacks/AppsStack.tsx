import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import { InAppBrowser, TabsManagerScreen } from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { AppsScreen } from "~Screens/Flows/App/AppsScreen/AppsScreen"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type RootStackParamListApps = {
    [Routes.APPS]: undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING | Routes.APPS
    }
    [Routes.APPS_SEARCH]: undefined
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.ACTIVITY_STAKING]: undefined
}

const { Navigator, Group, Screen } = createStackNavigator<RootStackParamListApps>()

export const AppsStack = () => {
    return (
        <Navigator id="AppsStack" screenOptions={{ headerShown: false }}>
            <Group>
                <Screen name={Routes.APPS} component={AppsScreen} options={{ headerShown: false }} />
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
                                  animationEnabled: false,
                              }
                    }
                />
            </Group>

            <Screen
                name={Routes.APPS_SEARCH}
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
                              animationEnabled: false,
                          }
                }
            />
            <Screen
                name={Routes.APPS_TABS_MANAGER}
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
                              animationEnabled: false,
                          }
                }
            />
        </Navigator>
    )
}
