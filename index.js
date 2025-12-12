/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useRef } from "react"
import { AppRegistry, LogBox } from "react-native"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"
import "@walletconnect/react-native-compat"
import { NavigationContainer } from "@react-navigation/native"
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
import {
    NotificationsProvider,
    PersistedThemeProvider,
    StoreContextProvider,
    useFeatureFlags,
} from "~Components/Providers"
import {
    clearTemporarySessions,
    selectAnalyticsTrackingEnabled,
    selectExternalDappSessions,
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
import { clientPersister, queryClient, RQ_CACHE_MAX_AGE } from "~Api/QueryProvider"
import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"
import { NAVIGATION_REF, Routes } from "~Navigation"
import { isLocale, useI18nContext } from "~i18n"
import { getLocales } from "react-native-localize"
import { InteractionProvider } from "~Components/Providers/InteractionProvider"
import { FeatureFlaggedSmartWallet } from "./src/Components/Providers/FeatureFlaggedSmartWallet"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { DeepLinksProvider } from "~Components/Providers/DeepLinksProvider"
import { DeviceProvider } from "~Components/Providers/DeviceProvider"
import { FeedbackProvider } from "~Components/Providers/FeedbackProvider"
import { ReceiptProcessorProvider } from "~Components/Providers/ReceiptProcessorProvider"

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

    const dispatch = useAppDispatch()

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

    const mounted = useRef(false)

    useEffect(() => {
        if (mounted.current) return
        mounted.current = true
        dispatch(clearTemporarySessions())
    }, [dispatch])

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const networkType = selectedNetwork.type
    const nodeUrl = selectedNetwork.currentUrl

    /**
     * Function called by the persistor to indicate if it needs to dehydrate a query or not
     */
    // const shouldDehydrateQuery = useCallback(q => q.meta?.persisted ?? true, [])
    const persistOptions = useMemo(() => {
        return {
            persister: clientPersister,
            maxAge: RQ_CACHE_MAX_AGE,
            dehydrateOptions: {
                //  shouldDehydrateQuery,
                shouldRedactErrors: () => false,
            },
            hydrateOptions: {
                shouldRedactErrors: () => false,
            },
        }
    }, [])

    if (!fontsLoaded) return
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
                <ConnexContextProvider>
                    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
                        <FeatureFlagsProvider>
                            <FeatureFlaggedSmartWallet nodeUrl={nodeUrl} networkType={networkType}>
                                <ReceiptProcessorProvider>
                                    <FeedbackProvider>
                                        <NavigationProvider>
                                            <InteractionProvider>
                                                <DeepLinksProvider>
                                                    <WalletConnectContextProvider>
                                                        <BottomSheetModalProvider>
                                                            <InAppBrowserProvider>
                                                                <NotificationsProvider>
                                                                    <DeviceProvider>
                                                                        <EntryPoint />
                                                                    </DeviceProvider>
                                                                </NotificationsProvider>
                                                            </InAppBrowserProvider>
                                                        </BottomSheetModalProvider>
                                                    </WalletConnectContextProvider>
                                                </DeepLinksProvider>
                                            </InteractionProvider>
                                        </NavigationProvider>
                                        <BaseToast />
                                    </FeedbackProvider>
                                </ReceiptProcessorProvider>
                            </FeatureFlaggedSmartWallet>
                        </FeatureFlagsProvider>
                    </PersistQueryClientProvider>
                </ConnexContextProvider>
            </KeyboardProvider>
        </GestureHandlerRootView>
    )
}

/**
 * @param {import ('~Api/FeatureFlags').FeatureFlags} featureFlags
 * @param {import ('~Storage/Redux').ExternalDappSession[]} externalDappSessions
 * @returns
 */
const generateLinkingConfig = () => {
    return {
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
                        AppsStack: {
                            path: "discover",
                            initialRouteName: "Apps",
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
}

const NavigationProvider = ({ children }) => {
    const theme = useTheme()

    const navigationTheme = useMemo(
        () => ({
            dark: theme.isDark,
            colors: theme.colors,
            fonts: {
                regular: {
                    fontFamily: typography.fontFamily["Inter-Regular"],
                    fontWeight: "normal",
                },
                medium: {
                    fontFamily: typography.fontFamily["Inter-Medium"],
                    fontWeight: "500",
                },
                bold: {
                    fontFamily: typography.fontFamily["Inter-Bold"],
                    fontWeight: "bold",
                },
                heavy: {
                    fontFamily: typography.fontFamily["Inter-Bold"],
                    fontWeight: "bold",
                },
            },
        }),
        [theme],
    )
    const externalDappSessions = useAppSelector(selectExternalDappSessions)
    const routeNameRef = useRef(null)
    const dispatch = useAppDispatch()
    const featureFlags = useFeatureFlags()

    return (
        <NavigationContainer
            ref={NAVIGATION_REF}
            onReady={() => {
                if (routeNameRef && routeNameRef.current === null) {
                    routeNameRef.current = NAVIGATION_REF.getCurrentRoute()?.name
                }
            }}
            onStateChange={async () => {
                const previousRouteName = routeNameRef.current
                const currentRouteName = NAVIGATION_REF.getCurrentRoute()?.name
                const trackScreenView = _currentRouteName => {
                    dispatch(setCurrentMountedScreen(_currentRouteName))
                }
                if (previousRouteName !== currentRouteName) {
                    routeNameRef.current = currentRouteName
                    trackScreenView(currentRouteName)
                }
            }}
            theme={navigationTheme}
            linking={generateLinkingConfig(featureFlags, externalDappSessions)}>
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
