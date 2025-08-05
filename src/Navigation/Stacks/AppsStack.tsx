import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { useNavAnimation } from "~Hooks"
import { Routes } from "~Navigation/Enums"
import { InAppBrowser, TabsManagerScreen } from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { AppsScreen } from "~Screens/Flows/App/AppsScreen/AppsScreen"

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

const { Navigator, Group, Screen } = createNativeStackNavigator<RootStackParamListApps>()

export const AppsStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="AppsStack" screenOptions={{ headerShown: false, animation }}>
            <Group>
                <Screen name={Routes.APPS} component={AppsScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.BROWSER}
                    component={InAppBrowser}
                    options={{ headerShown: false, animation: "slide_from_bottom" }}
                />
            </Group>

            <Screen
                name={Routes.APPS_SEARCH}
                component={AppsSearchScreen}
                options={{ headerShown: false, animation: "slide_from_bottom" }}
            />
            <Screen
                name={Routes.APPS_TABS_MANAGER}
                component={TabsManagerScreen}
                options={{ headerShown: false, animation: "slide_from_bottom" }}
            />
        </Navigator>
    )
}
