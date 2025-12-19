import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { Device } from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import {
    ChangeNetworkScreen,
    InAppBrowser,
    PrivacyScreen,
    TabsManagerScreen,
    WalletDetailScreen,
    WalletManagementScreen,
} from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { AppsScreen } from "~Screens/Flows/App/AppsScreen/AppsScreen"
import { DappTypeV2 } from "~Screens/Flows/App/AppsScreen/Components/Ecosystem/types"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type RootStackParamListApps = {
    [Routes.APPS]:
        | {
              filter?: DappTypeV2
          }
        | undefined
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?:
            | Routes.SETTINGS
            | Routes.HOME
            | Routes.ACTIVITY_STAKING
            | Routes.APPS
            | Routes.SWAP
            | Routes.COLLECTIBLES_COLLECTION_DETAILS
    }
    [Routes.APPS_SEARCH]: undefined
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.ACTIVITY_STAKING]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.WALLET_DETAILS]: { device: Device }
    [Routes.SETTINGS_NETWORK]: undefined
    [Routes.SETTINGS_PRIVACY]: undefined
}

const { Navigator, Screen } = createStackNavigator<RootStackParamListApps>()

export const AppsStack = () => {
    return (
        <Navigator id="AppsStack" screenOptions={{ headerShown: false, animationEnabled: isIOS() }}>
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
                    gestureEnabled: true,
                }}
            />

            <Screen
                name={Routes.APPS_SEARCH}
                component={AppsSearchScreen}
                options={{
                    headerShown: false,
                    cardStyleInterpolator: slideFadeInTransition,
                    presentation: "modal",
                    transitionSpec: TRANSITION_SPECS,
                    gestureDirection: "vertical",
                    gestureEnabled: true,
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
                    gestureEnabled: true,
                }}
            />

            <Screen
                name={Routes.WALLET_MANAGEMENT}
                component={WalletManagementScreen}
                options={{ headerShown: false }}
            />
            <Screen name={Routes.WALLET_DETAILS} component={WalletDetailScreen} options={{ headerShown: false }} />
            <Screen name={Routes.SETTINGS_NETWORK} component={ChangeNetworkScreen} options={{ headerShown: false }} />
            <Screen name={Routes.SETTINGS_PRIVACY} component={PrivacyScreen} options={{ headerShown: false }} />
        </Navigator>
    )
}
