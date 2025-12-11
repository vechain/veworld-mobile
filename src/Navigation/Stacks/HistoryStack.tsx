import { createStackNavigator } from "@react-navigation/stack"
import { default as React } from "react"
import { Activity, Device, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation/Enums"
import { slideFadeInTransition, TRANSITION_SPECS } from "~Navigation/Transitions"
import {
    ActivityDetailsScreen,
    ActivityScreen,
    InAppBrowser,
    PrivacyScreen,
    TabsManagerScreen,
    WalletDetailScreen,
    WalletManagementScreen,
} from "~Screens"
import { AppsSearchScreen } from "~Screens/Flows/App/AppsScreen"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export type HistoryStackParamList = {
    [Routes.HISTORY]:
        | {
              screen?:
                  | Routes.ACTIVITY_ALL
                  | Routes.ACTIVITY_B3TR
                  | Routes.ACTIVITY_TRANSFER
                  | Routes.ACTIVITY_STAKING
                  | Routes.ACTIVITY_SWAP
                  | Routes.ACTIVITY_NFT
                  | Routes.ACTIVITY_DAPPS
                  | Routes.ACTIVITY_OTHER
          }
        | undefined
    [Routes.ACTIVITY_DETAILS]: {
        activity: Activity
        token?: FungibleToken
        isSwap?: boolean
        decodedClauses?: TransactionOutcomes
        returnScreen?: Routes.HOME | Routes.HISTORY | Routes.TOKEN_DETAILS
    }
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
    [Routes.APPS_TABS_MANAGER]: undefined
    [Routes.APPS_SEARCH]: undefined
    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.WALLET_DETAILS]: { device: Device }
    [Routes.SETTINGS_PRIVACY]: undefined
}

const { Navigator, Screen } = createStackNavigator<HistoryStackParamList>()

export const HistoryStack = () => {
    return (
        <Navigator id="HistoryStack" screenOptions={{ headerShown: false, animationEnabled: isIOS() }}>
            <Screen name={Routes.HISTORY} component={ActivityScreen} options={{ headerShown: false }} />
            <Screen
                name={Routes.ACTIVITY_DETAILS}
                component={ActivityDetailsScreen}
                options={{
                    headerShown: false,
                    // Android-specific fix: Keeps HISTORY screen mounted to prevent Tab Navigator from unmounting
                    // This preserves tab state when navigating to/from activity details
                    detachPreviousScreen: isIOS() ? undefined : false,
                }}
            />
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
                name={Routes.WALLET_MANAGEMENT}
                component={WalletManagementScreen}
                options={{ headerShown: false }}
            />
            <Screen name={Routes.WALLET_DETAILS} component={WalletDetailScreen} options={{ headerShown: false }} />
            <Screen name={Routes.SETTINGS_PRIVACY} component={PrivacyScreen} options={{ headerShown: false }} />
        </Navigator>
    )
}
