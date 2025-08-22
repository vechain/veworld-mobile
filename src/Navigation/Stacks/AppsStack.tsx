import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { VbdDApp } from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import { InAppBrowser, TabsManagerScreen } from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { AppsPreviewScreen } from "~Screens/Flows/App/AppsScreen/AppsPreviewScreen"
import { AppsScreen } from "~Screens/Flows/App/AppsScreen/AppsScreen"

export type RootStackParamListApps = {
    [Routes.APPS]: undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING | Routes.APPS
    }
    [Routes.APPS_SEARCH]: undefined
    [Routes.APPS_PREVIEW]: {
        app: VbdDApp
    }
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.ACTIVITY_STAKING]: undefined
}

const { Navigator, Group, Screen } = createNativeStackNavigator<RootStackParamListApps>()

export const AppsStack = () => {
    return (
        <Navigator id="AppsStack" screenOptions={{ headerShown: false }}>
            <Group>
                <Screen name={Routes.APPS} component={AppsScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.APPS_PREVIEW}
                    component={AppsPreviewScreen}
                    options={{ headerShown: false, presentation: "transparentModal" }}
                />
                <Screen
                    name={Routes.BROWSER}
                    component={InAppBrowser}
                    options={{
                        headerShown: false,
                        //cardStyleInterpolator: slideFadeInTransition,
                        presentation: "transparentModal",
                        //transitionSpec: TRANSITION_SPECS,
                    }}
                />
            </Group>

            <Screen
                name={Routes.APPS_SEARCH}
                component={AppsSearchScreen}
                options={{
                    headerShown: false,
                    //cardStyleInterpolator: slideFadeInTransition,
                    presentation: "transparentModal",
                    //transitionSpec: TRANSITION_SPECS,
                }}
            />
            <Screen
                name={Routes.APPS_TABS_MANAGER}
                component={TabsManagerScreen}
                options={{
                    headerShown: false,
                    //cardStyleInterpolator: slideFadeInTransition,
                    presentation: "transparentModal",
                    //transitionSpec: TRANSITION_SPECS,
                }}
            />
        </Navigator>
    )
}
