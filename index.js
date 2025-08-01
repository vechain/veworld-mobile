/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useRef, useState } from "react"
import { AppRegistry, LogBox } from "react-native"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"
import "@walletconnect/react-native-compat"
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { useTheme } from "~Hooks"
import {
    ApplicationSecurityProvider,
    BaseToast,
    ConnexContextProvider,
    TranslationProvider,
    WalletConnectContextProvider,
    FeatureFlagsProvider,
} from "~Components"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useFonts } from "expo-font"
import {
    DesignSystemIcons,
    Inter_Bold,
    Inter_Light,
    Inter_Medium,
    Inter_Regular,
    Inter_SemiBold,
    Mono_Bold,
    Mono_Extra_Bold,
    Mono_Light,
    Mono_Regular,
    Rubik_Bold,
    Rubik_Regular,
    Rubik_SemiBold,
    Rubik_Medium,
    Rubik_Light,
} from "~Assets"
import { ERROR_EVENTS, typography } from "~Constants"
import { AnalyticsUtils, info, URIUtils } from "~Utils"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { NotificationsProvider, PersistedThemeProvider, StoreContextProvider } from "~Components/Providers"
import {
    selectAnalyticsTrackingEnabled,
    selectLanguage,
    selectSelectedNetwork,
    selectSentryTrackingEnabled,
    setCurrentMountedScreen,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import * as Sentry from "@sentry/react-native"
import "react-native-fast-url/src/polyfill"
import { InAppBrowserProvider } from "~Components/Providers/InAppBrowserProvider"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { clientPersister, queryClient } from "~Api/QueryProvider"
import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"
import { Routes } from "~Navigation"
import { isLocale, useI18nContext } from "~i18n"
import { getLocales } from "react-native-localize"
import { InteractionProvider } from "~Components/Providers/InteractionProvider"
import { SmartWalletWithPrivyProvider } from "./src/VechainWalletKit"

const { fontFamily } = typography

const isHermes = () => !!global.HermesInternal
info(ERROR_EVENTS.APP, "is Hermes active : ", isHermes())

if (__DEV__ && process.env.REACT_APP_UI_LOG === "false") {
    // hide all ui logs
    LogBox.ignoreAllLogs()
}

const Main = () => {
    const [fontsLoaded] = useFonts({
        [fontFamily["Inter-Bold"]]: Inter_Bold,
        [fontFamily["Inter-SemiBold"]]: Inter_SemiBold,
        [fontFamily["Inter-Regular"]]: Inter_Regular,
        [fontFamily["Inter-Light"]]: Inter_Light,
        [fontFamily["Inter-Medium"]]: Inter_Medium,
        [fontFamily["Mono-Extra-Bold"]]: Mono_Extra_Bold,
        [fontFamily["Mono-Bold"]]: Mono_Bold,
        [fontFamily["Mono-Regular"]]: Mono_Regular,
        [fontFamily["Mono-Light"]]: Mono_Light,
        [fontFamily["Rubik-Bold"]]: Rubik_Bold,
        [fontFamily["Rubik-Regular"]]: Rubik_Regular,
        [fontFamily["Rubik-SemiBold"]]: Rubik_SemiBold,
        [fontFamily["Rubik-Medium"]]: Rubik_Medium,
        [fontFamily["Rubik-Light"]]: Rubik_Light,
        [fontFamily.DesignSystemIcons]: DesignSystemIcons,
    })

    // Online status management
    // https://tanstack.com/query/v4/docs/react/react-native#online-status-management
    onlineManager.setEventListener(setOnline => {
        return NetInfo.addEventListener(state => {
            setOnline(!!state.isConnected)
        })
    })

    const isAnalyticsEnabled = useAppSelector(selectAnalyticsTrackingEnabled)

    const { setLocale } = useI18nContext()
    const language = useAppSelector(selectLanguage)

    // set the locale based on the language
    useEffect(() => {
        setLocale(
            language ??
            getLocales()
                .map(loc => loc.languageCode)
                .find(isLocale) ??
            "en",
        )
    }, [setLocale, language])

    // init analytics
    useEffect(() => {
        if (isAnalyticsEnabled) {
            // init mixpanel analytics
            AnalyticsUtils.initialize()
        }
    }, [isAnalyticsEnabled])

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const networkType = selectedNetwork.type
    const nodeUrl = selectedNetwork.currentUrl

    if (!fontsLoaded) return
    console.log("privy app id", process.env.PRIVY_APP_ID)
    console.log("privy client id", process.env.PRIVY_CLIENT_ID)
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ConnexContextProvider>
                <PersistQueryClientProvider
                    client={queryClient}
                    persistOptions={{
                        persister: clientPersister,
                    }}>
                    <SmartWalletWithPrivyProvider
                        config={{
                            providerConfig: {
                                appId: process.env.PRIVY_APP_ID,
                                clientId: process.env.PRIVY_CLIENT_ID,
                            },
                            networkConfig: {
                                nodeUrl,
                                networkType,
                            },
                        }}>
                        <FeatureFlagsProvider>
                            <NavigationProvider>
                                <InteractionProvider>
                                    <WalletConnectContextProvider>
                                        <BottomSheetModalProvider>
                                            <InAppBrowserProvider>
                                                <NotificationsProvider>
                                                    <EntryPoint />
                                                </NotificationsProvider>
                                            </InAppBrowserProvider>
                                        </BottomSheetModalProvider>
                                    </WalletConnectContextProvider>
                                </InteractionProvider>
                            </NavigationProvider>
                            <BaseToast />
                        </FeatureFlagsProvider>
                    </SmartWalletWithPrivyProvider>
                </PersistQueryClientProvider>
            </ConnexContextProvider>
        </GestureHandlerRootView>
    )
}

const linking = {
    prefixes: [
        "https://www.veworld.com/",
        "veworld://",
        "https://veworld.com/",
        "https://veworld.net/",
        "https://www.veworld.net/",
    ],
    config: {
        screens: {
            TabStack: {
                screens: {
                    NFTStack: {
                        path: "nfts",
                        initialRouteName: Routes.NFTS,
                    },
                    DiscoverStack: {
                        path: "discover",
                        initialRouteName: "Discover",
                        screens: {
                            Browser: {
                                path: "browser/:redirect?/:ul/:url",
                                parse: {
                                    ul: () => true,
                                    url: url => URIUtils.decodeUrl_HACK(url),
                                },
                            },
                        },
                    },
                },
            },
        },
    },
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

    const navigationRef = useNavigationContainerRef()
    const routeNameRef = useRef(null)
    const dispatch = useAppDispatch()

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={() => {
                if (routeNameRef && routeNameRef.current === null) {
                    routeNameRef.current = navigationRef.getCurrentRoute()?.name
                }
                setReady(true)
            }}
            onStateChange={async () => {
                const previousRouteName = routeNameRef.current
                const currentRouteName = navigationRef.getCurrentRoute()?.name
                const trackScreenView = _currentRouteName => {
                    dispatch(setCurrentMountedScreen(_currentRouteName))
                }
                if (previousRouteName !== currentRouteName) {
                    routeNameRef.current = currentRouteName
                    trackScreenView(currentRouteName)
                }
            }}
            theme={navigationTheme}
            linking={linking}>
            {ready ? children : null}
        </NavigationContainer>
    )
}

const SentryWrappedMain = Sentry.wrap(Main)

/**
 *  The network errors are extremly noisy and not actionable. If the phone does not have internet connection,
 *  it will throw a network error which is a standard failure case.
 *
 * @see https://docs.sentry.io/platforms/javascript/configuration/filtering/#ignore-errors
 */
const sentryIgnoreErrors = [
    "WebSocket connection failed for host: wss://relay.walletconnect.org",
    "AxiosError:",
    "Error in Beat WebSocket",
    "Error: Cannot find module 'react-native-localize'",
]
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
                ignoreErrors: sentryIgnoreErrors,
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
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
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
