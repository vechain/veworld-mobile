/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo } from "react"
import { AppRegistry, LogBox } from "react-native"
import { enableAllPlugins } from "immer"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"
import "@walletconnect/react-native-compat"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useTheme } from "~Hooks"
import {
    WalletConnectContextProvider,
    TranslationProvider,
    BaseToast,
} from "~Components"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useFonts } from "expo-font"
import {
    Inter_Bold,
    Inter_Light,
    Inter_Medium,
    Inter_Regular,
    Mono_Bold,
    Mono_Extra_Bold,
    Mono_Light,
    Mono_Regular,
} from "~Assets"
import { typography } from "~Constants"
import { info } from "~Utils"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import "./errorHandler"
import { StoreContextProvider } from "~Components/Providers/StoreProvider"
import { useAppSelector, selectSentryTrackingEnabled } from "~Storage/Redux"
import * as Sentry from "@sentry/react-native"
import { InternetDownScreen } from "~Screens"
import NetInfo from "@react-native-community/netinfo"

const { fontFamily } = typography

// immer setup
enableAllPlugins()

const isHermes = () => !!global.HermesInternal
info("is Hermes active : ", isHermes())

if (__DEV__ && process.env.REACT_APP_UI_LOG === "false") {
    // hide all ui logs
    LogBox.ignoreAllLogs()
}

const Main = () => {
    const { isConnected } = NetInfo.useNetInfo()

    const [fontsLoaded] = useFonts({
        [fontFamily["Inter-Bold"]]: Inter_Bold,
        [fontFamily["Inter-Regular"]]: Inter_Regular,
        [fontFamily["Inter-Light"]]: Inter_Light,
        [fontFamily["Inter-Medium"]]: Inter_Medium,
        [fontFamily["Mono-Extra-Bold"]]: Mono_Extra_Bold,
        [fontFamily["Mono-Bold"]]: Mono_Bold,
        [fontFamily["Mono-Regular"]]: Mono_Regular,
        [fontFamily["Mono-Light"]]: Mono_Light,
    })

    const sentryTrackingEnabled = useAppSelector(selectSentryTrackingEnabled)

    useEffect(() => {
        if (sentryTrackingEnabled) {
            Sentry.init({
                dsn: process.env.REACT_APP_SENTRY_DSN,
                // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
                // We recommend adjusting this value in production.
                tracesSampleRate: 1.0,
                environment: process.env.NODE_ENV,
            })
        } else {
            Sentry.close()
        }
    }, [sentryTrackingEnabled])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TranslationProvider>
                {isConnected ? (
                    <SafeAreaProvider>
                        <NavigationProvider>
                            <BottomSheetModalProvider>
                                <WalletConnectContextProvider>
                                    {fontsLoaded && <EntryPoint />}
                                </WalletConnectContextProvider>
                            </BottomSheetModalProvider>
                        </NavigationProvider>
                        <BaseToast />
                    </SafeAreaProvider>
                ) : (
                    <InternetDownScreen />
                )}
            </TranslationProvider>
        </GestureHandlerRootView>
    )
}

const NavigationProvider = ({ children }) => {
    const theme = useTheme()

    const navigationTheme = useMemo(
        () => ({
            dark: theme.isDark,
            colors: theme.colors,
        }),
        [theme],
    )
    return (
        <NavigationContainer theme={navigationTheme}>
            {children}
        </NavigationContainer>
    )
}

const ReduxWrappedMain = () => {
    return (
        <StoreContextProvider>
            <Main />
        </StoreContextProvider>
    )
}

AppRegistry.registerComponent(appName, () => Sentry.wrap(ReduxWrappedMain))

if (__DEV__) {
    const ignoreWarns = [
        "VirtualizedLists should never be nested inside plain ScrollViews",
    ]

    const errorWarn = global.console.error
    global.console.error = (...arg) => {
        for (const error of ignoreWarns) {
            if (arg[0]?.startsWith?.(error)) {
                return
            }
        }
        errorWarn(...arg)
    }
}
