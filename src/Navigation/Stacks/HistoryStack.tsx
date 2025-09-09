import { createStackNavigator } from "@react-navigation/stack"
import { default as React } from "react"
import { useFeatureFlags } from "~Components"
import { Activity, Device, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import {
    ActivityDetailsScreen,
    ActivityScreen,
    InAppBrowser,
    TabsManagerScreen,
    WalletDetailScreen,
    WalletManagementScreen,
} from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type HistoryStackParamList = {
    [Routes.HISTORY]: undefined
    [Routes.ACTIVITY_DETAILS]: {
        activity: Activity
        token?: FungibleToken
        isSwap?: boolean
        decodedClauses?: TransactionOutcomes
    }
    [Routes.BROWSER]: {
        url: string
        ul?: boolean
        returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING | Routes.APPS
    }
    [Routes.DISCOVER_TABS_MANAGER]: undefined
    [Routes.DISCOVER_SEARCH]: undefined
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.APPS_SEARCH]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.WALLET_DETAILS]: { device: Device }
}

const { Navigator, Screen } = createStackNavigator<HistoryStackParamList>()

export const HistoryStack = () => {
    const { betterWorldFeature } = useFeatureFlags()
    return (
        <Navigator id="HistoryStack" screenOptions={{ headerShown: false, animationEnabled: isIOS() }}>
            <Screen name={Routes.HISTORY} component={ActivityScreen} options={{ headerShown: false }} />
            <Screen name={Routes.ACTIVITY_DETAILS} component={ActivityDetailsScreen} options={{ headerShown: false }} />
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
            <Screen
                name={betterWorldFeature.appsScreen.enabled ? Routes.APPS_TABS_MANAGER : Routes.DISCOVER_TABS_MANAGER}
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
                name={betterWorldFeature.appsScreen.enabled ? Routes.APPS_SEARCH : Routes.DISCOVER_SEARCH}
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
                name={Routes.WALLET_MANAGEMENT}
                component={WalletManagementScreen}
                options={{ headerShown: false }}
            />
            <Screen name={Routes.WALLET_DETAILS} component={WalletDetailScreen} options={{ headerShown: false }} />
        </Navigator>
    )
}
