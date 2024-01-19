/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useState } from "react"
import { AppRegistry, LogBox } from "react-native"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"
import "@walletconnect/react-native-compat"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useTheme } from "~Hooks"
import {
    ApplicationSecurityProvider,
    BaseToast,
    ConnexContextProvider,
    TranslationProvider,
    WalletConnectContextProvider,
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
import { ERROR_EVENTS, typography } from "~Constants"
import { AnalyticsUtils, info } from "~Utils"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { PersistedThemeProvider, StoreContextProvider } from "~Components/Providers"
import { selectAnalyticsTrackingEnabled, selectSentryTrackingEnabled, useAppSelector } from "~Storage/Redux"
import * as Sentry from "@sentry/react-native"
import "react-native-url-polyfill/auto"
import { InAppBrowserProvider } from "~Components/Providers/InAppBrowserProvider"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { clientPersister, queryClient } from "~Api/QueryProvider"
import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"

const { fontFamily } = typography

if (__DEV__) {
    require("basil-ws-flipper").wsDebugPlugin
}

const isHermes = () => !!global.HermesInternal
info(ERROR_EVENTS.APP, "is Hermes active : ", isHermes())

if (__DEV__ && process.env.REACT_APP_UI_LOG === "false") {
    // hide all ui logs
    LogBox.ignoreAllLogs()
}

const Main = () => {
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

    // Online status management
    // https://tanstack.com/query/v4/docs/react/react-native#online-status-management
    onlineManager.setEventListener(setOnline => {
        return NetInfo.addEventListener(state => {
            setOnline(!!state.isConnected)
        })
    })

    const isAnalyticsEnabled = useAppSelector(selectAnalyticsTrackingEnabled)

    useEffect(() => {
        if (isAnalyticsEnabled) {
            // init mixpanel analytics
            AnalyticsUtils.initialize()
        }
    }, [isAnalyticsEnabled])

    if (!fontsLoaded) return

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ConnexContextProvider>
                <PersistQueryClientProvider
                    client={queryClient}
                    persistOptions={{
                        persister: clientPersister,
                    }}>
                    <NavigationProvider>
                        <WalletConnectContextProvider>
                            <InAppBrowserProvider>
                                <BottomSheetModalProvider>
                                    <EntryPoint />
                                </BottomSheetModalProvider>
                            </InAppBrowserProvider>
                        </WalletConnectContextProvider>
                    </NavigationProvider>
                    <BaseToast />
                </PersistQueryClientProvider>
            </ConnexContextProvider>
        </GestureHandlerRootView>
    )
}

const NavigationProvider = ({ children }) => {
    const theme = useTheme()

    const [ready, setReady] = useState(false)

    const navigationTheme = useMemo(
        () => ({
            dark: theme.isDark,
            colors: theme.colors,
        }),
        [theme],
    )

    return (
        <NavigationContainer onReady={() => setReady(true)} theme={navigationTheme}>
            {ready ? children : null}
        </NavigationContainer>
    )
}

const SentryWrappedMain = Sentry.wrap(Main)

const SentryInitialedMain = () => {
    const sentryTrackingEnabled = useAppSelector(selectSentryTrackingEnabled)
    const [initializedSentry, setInitializedSentry] = React.useState(false)

    useEffect(() => {
        if (sentryTrackingEnabled) {
            Sentry.init({
                dsn: process.env.REACT_APP_SENTRY_DSN,
                // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
                // We recommend adjusting this value in production.
                tracesSampleRate: 1.0,
                environment: process.env.NODE_ENV,
            })
            setInitializedSentry(true)
        } else {
            Sentry.close()
        }
    }, [sentryTrackingEnabled])

    return initializedSentry ? <SentryWrappedMain /> : <Main />
}

const ReduxWrappedMain = () => {
    return (
        <SafeAreaProvider>
            <TranslationProvider>
                <PersistedThemeProvider>
                    <ApplicationSecurityProvider>
                        <StoreContextProvider>
                            <SentryInitialedMain />
                        </StoreContextProvider>
                    </ApplicationSecurityProvider>
                </PersistedThemeProvider>
            </TranslationProvider>
        </SafeAreaProvider>
    )
}

AppRegistry.registerComponent(appName, () => ReduxWrappedMain)

if (__DEV__) {
    const ignoreWarns = ["VirtualizedLists should never be nested inside plain ScrollViews"]

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
