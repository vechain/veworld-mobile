import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
    NativeModules,
    NativeScrollEvent,
    NativeScrollPoint,
    NativeSyntheticEvent,
    Platform,
    PlatformOSType,
} from "react-native"
import WebView, { WebViewMessageEvent, WebViewNavigation } from "react-native-webview"
import { showInfoToast, showWarningToast } from "~Components"
import { AnalyticsEvent, ERROR_EVENTS, RequestMethods } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useSetSelectedAccount } from "~Hooks"
import { Locales, useI18nContext } from "~i18n"
import {
    AccountWithDevice,
    CertificateRequest,
    InAppRequest,
    Network,
    TransactionRequest,
    TypeDataRequest,
} from "~Model"
import { Routes } from "~Navigation"
import {
    addConnectedDiscoveryApp,
    changeSelectedNetwork,
    selectAccounts,
    selectConnectedDiscoverDApps,
    selectFeaturedDapps,
    selectNetworks,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, DAppUtils, debug, warn } from "~Utils"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { useInteraction } from "../InteractionProvider"
import { ConnectBottomSheet } from "./Components/ConnectBottomSheet"
import { CertRequest, SignedDataRequest, TxRequest, WindowRequest, WindowResponse } from "./types"

const { PackageDetails } = NativeModules

export interface PackageInfoResponse {
    packageName: string
    versionName: string
    versionCode: number
    verificationFailed: boolean
}

// Resolve an issue with types for the WebView component
type EnhancedScrollEvent = Omit<NativeScrollEvent, "zoomScale"> & { zoomScale?: number }

type ContextType = {
    webviewRef: React.MutableRefObject<WebView | undefined>
    onMessage: (event: WebViewMessageEvent) => void
    onScroll: (event: NativeSyntheticEvent<Readonly<EnhancedScrollEvent>>) => void
    postMessage: (message: WindowResponse) => void
    onNavigationStateChange: (navState: WebViewNavigation) => void
    injectVechainScript: () => string
    originWhitelist: string[]
    navigationCanGoBack: boolean
    canGoBack: boolean
    canGoForward: boolean
    closeInAppBrowser: () => void
    goBack: () => void
    goForward: () => void
    goHome: () => void
    navigateToUrl: (url: string) => void
    showToolbars: boolean
    navigationState: WebViewNavigation | undefined
    resetWebViewState: () => void
    addAppAndNavToRequest: (request: InAppRequest) => void
    targetAccount?: AccountWithDevice
    targetNetwork?: Network
    handleCloseChangeAccountNetworkBottomSheet: () => void
    handleConfirmChangeAccountNetworkBottomSheet: () => void
    ChangeAccountNetworkBottomSheetRef: React.RefObject<BottomSheetModalMethods>
    switchAccount: (request: WindowRequest) => void
    isLoading: boolean
    isDapp: boolean
}

const Context = React.createContext<ContextType | undefined>(undefined)

enum ScrollDirection {
    NONE = "NONE",
    UP = "UP",
    DOWN = "DOWN",
}

type Props = {
    children: React.ReactNode
    platform: PlatformOSType
}

export const DISCOVER_HOME_URL = "https://apps.vechain.org/#all"

const ORIGIN_WHITELIST = ["http://", "https://", "about:*", "blob:"]

export const InAppBrowserProvider = ({ children, platform = Platform.OS }: Props) => {
    const nav = useNavigation()

    const [packageInfo, setPackageInfo] = React.useState<PackageInfoResponse | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const { connectBsRef, setConnectBsData } = useInteraction()

    useEffect(() => {
        if (platform === "ios") {
            setIsLoading(false)
            return
        }

        if (!isLoading) return

        PackageDetails.getPackageInfo().then((info: PackageInfoResponse) => {
            setPackageInfo(info)
            setIsLoading(false)
        })
    }, [isLoading, platform])

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const networks = useAppSelector(selectNetworks)
    const accounts = useAppSelector(selectAccounts)
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const { LL, locale } = useI18nContext()
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const connectedDiscoveryApps = useAppSelector(selectConnectedDiscoverDApps)
    const allDapps = useAppSelector(selectFeaturedDapps)
    const {
        ref: ChangeAccountNetworkBottomSheetRef,
        onOpen: openChangeAccountNetworkBottomSheet,
        onClose: closeChangeAccountNetworkBottomSheet,
    } = useBottomSheetModal()
    const [targetAccount, setTargetAccount] = useState<AccountWithDevice>()
    const [targetNetwork, setTargetNetwork] = useState<Network>()
    const [navigateToOperation, setNavigateToOperation] = useState<Function>()
    const [showToolbars, setShowToolbars] = useState(true)

    const handleCloseChangeAccountNetworkBottomSheet = useCallback(() => {
        closeChangeAccountNetworkBottomSheet()
        setTargetAccount(undefined)
        setTargetNetwork(undefined)
        showWarningToast({ text1: LL.BROWSER_CHANGE_ACCOUNT_NETWORK_WARNING() })
    }, [LL, closeChangeAccountNetworkBottomSheet])

    const handleConfirmChangeAccountNetworkBottomSheet = useCallback(() => {
        closeChangeAccountNetworkBottomSheet()
        setTargetAccount(undefined)
        setTargetNetwork(undefined)
        navigateToOperation?.()
    }, [closeChangeAccountNetworkBottomSheet, navigateToOperation])

    const dispatch = useAppDispatch()

    const track = useAnalyticTracking()
    let prevY = useRef<number>(0) // Used to detect the scroll direction of the web view
    const webviewRef = useRef<WebView | undefined>()

    const [navigationState, setNavigationState] = useState<WebViewNavigation | undefined>(undefined)

    const canGoBack = useMemo(() => {
        return navigationState?.canGoBack ?? false
    }, [navigationState])

    const canGoForward = useMemo(() => {
        return navigationState?.canGoForward ?? false
    }, [navigationState])

    const postMessage = useCallback(
        (message: WindowResponse) => {
            debug(ERROR_EVENTS.DAPP, "responding to dapp request", message.id)

            webviewRef.current?.injectJavaScript(
                `
                    setTimeout(function() { 
                    postMessage(${JSON.stringify(message)}, "*")
                    }, 1);
                    `,
            )

            /**
             * Track the success / failure rates against the dapp URL
             */
            let analyticEvent: AnalyticsEvent | undefined

            if (message.method === RequestMethods.REQUEST_TRANSACTION) {
                if ("err" in message) {
                    analyticEvent = AnalyticsEvent.DISCOVERY_TRANSACTION_ERROR
                } else {
                    analyticEvent = AnalyticsEvent.DISCOVERY_TRANSACTION_SUCCESS
                }
            }

            if (message.method === RequestMethods.SIGN_CERTIFICATE) {
                if ("err" in message) {
                    analyticEvent = AnalyticsEvent.DISCOVERY_CERTIFICATE_ERROR
                } else {
                    analyticEvent = AnalyticsEvent.DISCOVERY_CERTIFICATE_SUCCESS
                }
            }

            if (message.method === RequestMethods.SIGN_TYPED_DATA) {
                if ("err" in message) {
                    analyticEvent = AnalyticsEvent.DISCOVERY_SIGNED_DATA_ERROR
                } else {
                    analyticEvent = AnalyticsEvent.DISCOVERY_SIGNED_DATA_SUCCESS
                }
            }

            if (analyticEvent) {
                track(analyticEvent, {
                    dapp: navigationState?.url ? new URL(navigationState.url).hostname : undefined,
                })
            }
        },
        [navigationState, track],
    )

    const navigateToUrl = useCallback((url: string) => {
        // Check if the URL starts with 'http://' or 'https://'
        const hasProtocol = /^https?:\/\//i.test(url)
        const finalUrl = hasProtocol ? url : `http://${url}`

        webviewRef.current?.injectJavaScript(`
            window.location.href = "${finalUrl}"
        `)
    }, [])

    const switchNetwork = useCallback(
        (request: WindowRequest) => {
            if (selectedNetwork.genesis.id === request.genesisId) {
                return
            }

            const network = networks.find(n => n.genesis.id === request.genesisId)

            if (!network) {
                postMessage({
                    id: request.id,
                    error: "Invalid network",
                    method: request.method,
                })

                throw new Error("Invalid network")
            }

            showInfoToast({
                text1: LL.NOTIFICATION_WC_NETWORK_CHANGED({
                    network: network.name,
                }),
            })

            dispatch(changeSelectedNetwork(network))
        },
        [LL, selectedNetwork, dispatch, postMessage, networks],
    )

    const switchAccount = useCallback(
        (request: WindowRequest) => {
            if (!request.options.signer) return

            if (compareAddresses(selectedAccountAddress, request.options.signer)) {
                return
            }

            const requestedAccount: AccountWithDevice | undefined = accounts.find(acct => {
                return AddressUtils.compareAddresses(request.options.signer, acct.address)
            })

            if (!requestedAccount) {
                postMessage({
                    id: request.id,
                    error: "Invalid account",
                    method: request.method,
                })

                throw new Error("Invalid account")
            }

            onSetSelectedAccount(requestedAccount)

            showInfoToast({
                text1: LL.NOTIFICATION_WC_ACCOUNT_CHANGED({
                    account: requestedAccount.alias,
                }),
            })
        },
        [LL, postMessage, accounts, onSetSelectedAccount, selectedAccountAddress],
    )

    const initAndOpenChangeAccountNetworkBottomSheet = useCallback(
        (request: WindowRequest) => {
            if (!request.options.signer || compareAddresses(selectedAccountAddress, request.options.signer)) {
                setTargetAccount(undefined)
            } else {
                const requestedAccount: AccountWithDevice | undefined = accounts.find(acct => {
                    return AddressUtils.compareAddresses(request.options.signer, acct.address)
                })

                // change account if it exists
                if (requestedAccount && !compareAddresses(requestedAccount.address, selectedAccountAddress)) {
                    nav.navigate(Routes.DAPP_CHANGE_ACCOUNT_SCREEN, {
                        request: request,
                    })
                    return
                }

                // cancel operation if account not found
                if (!requestedAccount) {
                    showInfoToast({
                        text1: LL.NOTIFICATION_DAPP_REQUESTED_ACCOUNT_NOT_FOUND(),
                    })

                    postMessage({
                        id: request.id,
                        error: "Invalid account",
                        method: request.method,
                    })

                    return
                }

                setTargetAccount(requestedAccount)
            }

            let network: Network | undefined

            if (selectedNetwork.genesis.id !== request.genesisId) {
                network = networks.find(n => n.genesis.id === request.genesisId)
                network ? setTargetNetwork(network) : setTargetNetwork(undefined)
            }

            if (!network) {
                showInfoToast({
                    text1: LL.BROWSER_NETWORK_NOT_FOUND(),
                })

                postMessage({
                    id: request.id,
                    error: "Invalid network",
                    method: request.method,
                })

                return
            }

            openChangeAccountNetworkBottomSheet()
        },
        [
            LL,
            accounts,
            nav,
            networks,
            openChangeAccountNetworkBottomSheet,
            postMessage,
            selectedAccountAddress,
            selectedNetwork.genesis.id,
        ],
    )

    // ~ NAVIGATION TO MESSAGE SCREEN
    const navigateToTransactionScreen = useCallback(
        (request: TxRequest, appUrl: string, appName: string) => {
            const message = request.message as Connex.Vendor.TxMessage

            try {
                switchAccount(request)
                switchNetwork(request)
            } catch {
                return
            }

            const isAlreadyConnected = !!connectedDiscoveryApps?.find(app => app.href === new URL(appUrl).hostname)

            const req: TransactionRequest = {
                method: request.method,
                id: request.id,
                type: "in-app",
                message: message,
                options: request.options,
                appUrl,
                appName,
                isFirstRequest: !isAlreadyConnected,
            }

            if (isAlreadyConnected) {
                nav.navigate(Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN, {
                    request: req,
                    isInjectedWallet: true,
                })
            } else {
                setConnectBsData({
                    type: "in-app",
                    initialRequest: req,
                    appUrl,
                    appName,
                })
                connectBsRef.current?.present()
            }
        },
        [connectBsRef, connectedDiscoveryApps, nav, setConnectBsData, switchAccount, switchNetwork],
    )

    const navigateToCertificateScreen = useCallback(
        (request: CertRequest, appUrl: string, appName: string) => {
            const message = request.message as Connex.Vendor.CertMessage

            try {
                switchAccount(request)
                switchNetwork(request)
            } catch {
                return
            }

            const isAlreadyConnected = !!connectedDiscoveryApps?.find(app => app.href === new URL(appUrl).hostname)

            const req: CertificateRequest = {
                method: request.method,
                id: request.id,
                type: "in-app",
                message: message,
                options: request.options,
                appUrl,
                appName,
                isFirstRequest: !isAlreadyConnected,
            }

            if (isAlreadyConnected) {
                nav.navigate(Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN, {
                    request: req,
                })
            } else {
                setConnectBsData({
                    type: "in-app",
                    initialRequest: req,
                    appUrl,
                    appName,
                })
                connectBsRef.current?.present()
            }
        },
        [connectBsRef, connectedDiscoveryApps, nav, setConnectBsData, switchAccount, switchNetwork],
    )

    const navigateToSignedDataScreen = useCallback(
        (request: SignedDataRequest, appUrl: string, appName: string) => {
            try {
                switchAccount(request)
                switchNetwork(request)
            } catch {
                return
            }

            const isAlreadyConnected = !!connectedDiscoveryApps?.find(app => app.href === new URL(appUrl).hostname)

            const req: TypeDataRequest = {
                method: request.method,
                id: request.id,
                type: "in-app",
                options: request.options,
                appUrl,
                appName,
                isFirstRequest: !isAlreadyConnected,
                domain: request.domain,
                types: request.types,
                value: request.value,
                origin: request.origin,
            }

            if (isAlreadyConnected) {
                nav.navigate(Routes.CONNECTED_APP_SIGN_TYPED_MESSAGE_SCREEN, {
                    request: req,
                })
            } else {
                setConnectBsData({
                    type: "in-app",
                    initialRequest: req,
                    appUrl,
                    appName,
                })
                connectBsRef.current?.present()
            }
        },
        [connectBsRef, connectedDiscoveryApps, nav, setConnectBsData, switchAccount, switchNetwork],
    )

    // ~ MESSAGE VALIDATION
    const validateTxMessage = useCallback(
        (request: TxRequest, appUrl: string, appName: string) => {
            const message = request.message

            track(AnalyticsEvent.DISCOVERY_TRANSACTION_REQUESTED, {
                dapp: navigationState?.url,
            })

            const isValid = DAppUtils.isValidTxMessage(message)

            if (!isValid) {
                debug(ERROR_EVENTS.DAPP, "Invalid transaction", message)
                return postMessage({
                    id: request.id,
                    error: "Invalid transaction",
                    method: RequestMethods.REQUEST_TRANSACTION,
                })
            }

            if (
                (!request.options.signer || compareAddresses(selectedAccountAddress, request.options.signer)) &&
                selectedNetwork.genesis.id === request.genesisId
            ) {
                return navigateToTransactionScreen(request, appUrl, appName)
            }

            setNavigateToOperation(() => () => navigateToTransactionScreen(request, appUrl, appName))
            initAndOpenChangeAccountNetworkBottomSheet(request)
        },
        [
            track,
            navigationState?.url,
            selectedAccountAddress,
            selectedNetwork.genesis.id,
            initAndOpenChangeAccountNetworkBottomSheet,
            postMessage,
            navigateToTransactionScreen,
        ],
    )

    const validateCertMessage = useCallback(
        (request: CertRequest, appUrl: string, appName: string) => {
            const message = request.message

            track(AnalyticsEvent.DISCOVERY_CERTIFICATE_REQUESTED, {
                dapp: navigationState?.url,
            })

            const isValid = DAppUtils.isValidCertMessage(message)

            if (!isValid) {
                return postMessage({
                    id: request.id,
                    error: "Invalid certificate message",
                    method: RequestMethods.SIGN_CERTIFICATE,
                })
            }

            if (
                (!request.options.signer || compareAddresses(selectedAccountAddress, request.options.signer)) &&
                selectedNetwork.genesis.id === request.genesisId
            ) {
                return navigateToCertificateScreen(request, appUrl, appName)
            }

            setNavigateToOperation(() => () => navigateToCertificateScreen(request, appUrl, appName))
            initAndOpenChangeAccountNetworkBottomSheet(request)
        },
        [
            initAndOpenChangeAccountNetworkBottomSheet,
            navigateToCertificateScreen,
            navigationState?.url,
            postMessage,
            selectedAccountAddress,
            selectedNetwork.genesis.id,
            track,
        ],
    )

    const validateSignedDataMessage = useCallback(
        (request: SignedDataRequest, appUrl: string, appName: string) => {
            const message = request

            const isValid = DAppUtils.isValidSignedDataMessage(message)

            track(AnalyticsEvent.DISCOVERY_SIGNED_DATA_REQUESTED, {
                dapp: navigationState?.url,
            })

            if (!isValid) {
                return postMessage({
                    id: request.id,
                    error: "Invalid signed data message",
                    method: RequestMethods.SIGN_TYPED_DATA,
                })
            }

            if (
                (!request.options.signer || compareAddresses(selectedAccountAddress, request.options.signer)) &&
                selectedNetwork.genesis.id === request.genesisId
            ) {
                return navigateToSignedDataScreen(message, appUrl, appName)
            }

            setNavigateToOperation(() => () => navigateToSignedDataScreen(request, appUrl, appName))
            initAndOpenChangeAccountNetworkBottomSheet(message)
        },
        [
            initAndOpenChangeAccountNetworkBottomSheet,
            navigateToSignedDataScreen,
            navigationState?.url,
            postMessage,
            selectedAccountAddress,
            selectedNetwork.genesis.id,
            track,
        ],
    )

    const addAppAndNavToRequest = useCallback(
        (request: InAppRequest) => {
            dispatch(
                addConnectedDiscoveryApp({
                    name: request.appName,
                    href: new URL(request.appUrl).hostname,
                    connectedTime: Date.now(),
                }),
            )

            if (request.method === "thor_sendTransaction") {
                nav.navigate(Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN, {
                    request: request,
                    isInjectedWallet: true,
                })
            }

            if (request.method === "thor_signCertificate") {
                nav.navigate(Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN, {
                    request,
                })
            }

            if (request.method === "thor_signTypedData") {
                nav.navigate(Routes.CONNECTED_APP_SIGN_TYPED_MESSAGE_SCREEN, {
                    request,
                })
            }
        },
        [dispatch, nav],
    )

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            debug(ERROR_EVENTS.DAPP, event.nativeEvent.url)

            if (!event.nativeEvent.data) {
                return
            }

            const data = JSON.parse(event.nativeEvent.data)

            if (data.method === RequestMethods.REQUEST_TRANSACTION) {
                return validateTxMessage(data, event.nativeEvent.url, event.nativeEvent.title)
            } else if (data.method === RequestMethods.SIGN_CERTIFICATE) {
                return validateCertMessage(data, event.nativeEvent.url, event.nativeEvent.title)
            } else if (data.method === RequestMethods.SIGN_TYPED_DATA) {
                return validateSignedDataMessage(data, event.nativeEvent.url, event.nativeEvent.title)
            } else {
                warn(ERROR_EVENTS.DAPP, "Unknown method", event.nativeEvent)
            }
        },
        [validateTxMessage, validateCertMessage, validateSignedDataMessage],
    )

    const detectScrollDirection = useCallback(
        (offset: NativeScrollPoint): ScrollDirection => {
            const { y } = offset
            let direction = ScrollDirection.NONE
            if (prevY.current < y) direction = ScrollDirection.DOWN
            if (prevY.current > y) direction = ScrollDirection.UP

            prevY.current = y

            return direction
        },
        [prevY],
    )

    // Add a ref to store the maximum layout height (when toolbars are hidden)
    const maxLayoutHeightRef = useRef<number | null>(null)

    const onScroll = useCallback(
        (event: NativeSyntheticEvent<Readonly<EnhancedScrollEvent>>) => {
            const { contentOffset: offset, layoutMeasurement, contentSize } = event.nativeEvent
            const direction = detectScrollDirection(offset)

            // Track the maximum layout height to use as stable reference
            if (
                !showToolbars &&
                (maxLayoutHeightRef.current === null || layoutMeasurement.height > maxLayoutHeightRef.current)
            ) {
                maxLayoutHeightRef.current = layoutMeasurement.height
            }

            // Use the stable reference height for calculations
            const referenceHeight = maxLayoutHeightRef.current || layoutMeasurement.height

            // Calculate threshold with a more conservative buffer to prevent bouncing
            const threshold = contentSize.height - referenceHeight + 50

            // Enable toolbar hiding only if the content height is larger than the reference height
            if (contentSize.height > referenceHeight) {
                // Add hysteresis to prevent rapid toggling
                const hideThreshold = 100
                const showThreshold = Math.max(threshold - 50, 0) // Additional buffer for showing

                if (direction === ScrollDirection.DOWN && showToolbars && offset.y > hideThreshold) {
                    setShowToolbars(false)
                }
                if (direction === ScrollDirection.UP && !showToolbars && offset.y <= showThreshold) {
                    setShowToolbars(true)
                }
                if (offset.y === 0 || offset.y < 0) {
                    setShowToolbars(true)
                }
            }
        },
        [detectScrollDirection, showToolbars],
    )

    const onNavigationStateChange = useCallback((navState: WebViewNavigation) => {
        setNavigationState(navState)
    }, [])

    const closeInAppBrowser = useCallback(() => {
        nav.goBack()
    }, [nav])

    const goBack = useCallback(() => {
        webviewRef.current?.goBack()
    }, [])

    const goForward = useCallback(() => {
        webviewRef.current?.goForward()
    }, [])

    const goHome = useCallback(() => {
        navigateToUrl(DISCOVER_HOME_URL)
    }, [navigateToUrl])

    const resetWebViewState = useCallback(() => {
        setNavigationState(undefined)
        webviewRef.current = undefined
    }, [])

    const isDapp = useMemo(() => {
        if (!navigationState) return false
        return Boolean(
            allDapps.find(dapp => {
                const navStateRoot = new URL(navigationState.url).origin
                const dappRoot = new URL(dapp.href).origin
                return navStateRoot === dappRoot
            }),
        )
    }, [allDapps, navigationState])

    const contextValue = React.useMemo(() => {
        return {
            isLoading,
            webviewRef,
            onMessage,
            onScroll,
            postMessage,
            injectVechainScript: () => injectedJs({ locale, packageInfo }),
            onNavigationStateChange,
            navigationCanGoBack: nav.canGoBack(),
            canGoBack,
            originWhitelist: ORIGIN_WHITELIST,
            canGoForward,
            closeInAppBrowser,
            goBack,
            goForward,
            navigateToUrl,
            goHome,
            showToolbars,
            navigationState,
            resetWebViewState,
            addAppAndNavToRequest,
            targetAccount,
            targetNetwork,
            handleCloseChangeAccountNetworkBottomSheet,
            handleConfirmChangeAccountNetworkBottomSheet,
            ChangeAccountNetworkBottomSheetRef,
            switchAccount,
            isDapp,
        }
    }, [
        isLoading,
        onMessage,
        onScroll,
        postMessage,
        locale,
        onNavigationStateChange,
        nav,
        canGoBack,
        canGoForward,
        closeInAppBrowser,
        goBack,
        goForward,
        navigateToUrl,
        goHome,
        showToolbars,
        navigationState,
        resetWebViewState,
        addAppAndNavToRequest,
        targetAccount,
        targetNetwork,
        handleCloseChangeAccountNetworkBottomSheet,
        handleConfirmChangeAccountNetworkBottomSheet,
        ChangeAccountNetworkBottomSheetRef,
        switchAccount,
        packageInfo,
        isDapp,
    ])

    return (
        <Context.Provider value={contextValue}>
            <ConnectBottomSheet />
            {children}
        </Context.Provider>
    )
}

export const useInAppBrowser = () => {
    const context = useContext(Context)

    if (!context) {
        throw new Error("useInAppBrowser must be used within a InAppBrowserProvider")
    }

    return context
}

/**
 * @developer: uncomment and add the below to debug tho console logs in the mobile browser (
 */
// const consoleLog = (type, log, data1, data2) => window.ReactNativeWebView.postMessage(JSON.stringify({type, log, data1, data2}))
//
// console = {
//     log: (log, data1, data2) => consoleLog('log', log, data1, data2),
//     debug: (log, data1, data2) => consoleLog('debug', log, data1, data2),
//     info: (log, data1, data2) => consoleLog('info', log, data1, data2),
//     warn: (log, data1, data2) => consoleLog('warn', log, data1, data2),
//     error: (log, data1, data2) => consoleLog('error', log, data1, data2),
// };

const injectedJs = ({ locale, packageInfo }: { locale: Locales; packageInfo: PackageInfoResponse | null }) => {
    const script = `
function newResponseHandler(id) {
    return new Promise((resolve, reject) => {
        addEventListener("message", event => {
            try {                
                if (event.data.id !== id) 
                    return

                if (event.data.error) {
                    reject(new Error(event.data.error))
                } else {
                    resolve(event.data.data)
                }
            } catch (e) {
                console.error(e.message)
            }
        })
    })
}

function generateRandomId() {
    return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
}

window.vechain = {
    isVeWorld: true,
    isInAppBrowser: true,
    acceptLanguage: "${locale}",
    integrity: ${JSON.stringify(packageInfo || {})},
    
    newConnexSigner: function (genesisId) {
        return {
            signTx(message, options) {
                const request = {
                    id: generateRandomId(),
                    method: "thor_sendTransaction",
                    origin: window.origin,
                    message,
                    options,
                    genesisId,
                }

                window.ReactNativeWebView.postMessage(JSON.stringify(request))

                return newResponseHandler(request.id)
            },

            signCert(message, options) {
                const request = {
                    id: generateRandomId(),
                    method: "thor_signCertificate",
                    origin: window.origin,
                    message,
                    options,
                    genesisId,
                }

                window.ReactNativeWebView.postMessage(JSON.stringify(request))

                return newResponseHandler(request.id)
            },

            signTypedData(domain, types, value, options) {
                const request = {
                    id: generateRandomId(),
                    method: "thor_signTypedData",
                    origin: window.origin,
                    domain,
                    types,
                    value,
                    genesisId,
                    options,
                }

                window.ReactNativeWebView.postMessage(JSON.stringify(request))

                return newResponseHandler(request.id)
            }, 
        }
    },
}

true
`
    return script
}
