import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { Device } from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import { InAppBrowser, TabsManagerScreen, WalletDetailScreen, WalletManagementScreen } from "~Screens"
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
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.WALLET_DETAILS]: { device: Device }
}

const { Navigator, Group, Screen } = createStackNavigator<RootStackParamListApps>()

export const AppsStack = () => {
    return (
        <Navigator id="AppsStack" screenOptions={{ headerShown: false, animationEnabled: isIOS() }}>
            <Group>
                <Screen name={Routes.APPS} component={AppsScreen} options={{ headerShown: false }} />
                <Screen
                    name={Routes.BROWSER}
                    component={InAppBrowser}
                    options={{
                        headerShown: false,
                        cardStyleInterpolator: slideFadeInTransition,
                        presentation: "modal",
                        transitionSpec: TRANSITION_SPECS,
                        gestureDirection: "vertical",
                    }}
                />
            </Group>

            <Screen
                name={Routes.APPS_SEARCH}
                component={AppsSearchScreen}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                }}
            />
            <Screen
                name={Routes.APPS_TABS_MANAGER}
                component={TabsManagerScreen}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                }}
            />

            <Screen
                name={Routes.WALLET_MANAGEMENT}
                component={WalletManagementScreen}
                options={{ headerShown: false }}
            />
            <Screen name={Routes.WALLET_DETAILS} component={WalletDetailScreen} options={{ headerShown: false }} />
        </Navigator>
    )
}
