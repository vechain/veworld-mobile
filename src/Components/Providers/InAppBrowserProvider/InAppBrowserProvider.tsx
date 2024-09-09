import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useContext, useMemo, useRef, useState } from "react"
import { NativeScrollEvent, NativeScrollPoint, NativeSyntheticEvent } from "react-native"
import WebView, { WebViewMessageEvent, WebViewNavigation } from "react-native-webview"
import { showInfoToast, showWarningToast } from "~Components"
import { AnalyticsEvent, ERROR_EVENTS, RequestMethods } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useSetSelectedAccount } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, CertificateRequest, InAppRequest, Network, TransactionRequest } from "~Model"
import { Routes } from "~Navigation"
import {
    addConnectedDiscoveryApp,
    changeSelectedNetwork,
    selectAccounts,
    selectConnectedDiscoverDApps,
    selectNetworks,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, DAppUtils, debug, warn } from "~Utils"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { WindowRequest, WindowResponse } from "./types"

// Resolve an issue with types for the WebView component
type EnhancedScrollEvent = Omit<NativeScrollEvent, "zoomScale"> & { zoomScale?: number }

type ContextType = {
    webviewRef: React.MutableRefObject<WebView | undefined>
    onMessage: (event: WebViewMessageEvent) => void
    onScroll: (event: NativeSyntheticEvent<Readonly<EnhancedScrollEvent>>) => void
    postMessage: (message: WindowResponse) => void
    onNavigationStateChange: (navState: WebViewNavigation) => void
    injectVechainScript: string
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
}

const Context = React.createContext<ContextType | undefined>(undefined)

enum ScrollDirection {
    NONE = "NONE",
    UP = "UP",
    DOWN = "DOWN",
}

type Props = {
    children: React.ReactNode
}

export const DISCOVER_HOME_URL = "https://apps.vechain.org/#all"

export const InAppBrowserProvider = ({ children }: Props) => {
    const nav = useNavigation()

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const networks = useAppSelector(selectNetworks)
    const accounts = useAppSelector(selectAccounts)
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const { LL } = useI18nContext()
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const connectedDiscoveryApps = useAppSelector(selectConnectedDiscoverDApps)
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

    const navigateToTransactionScreen = useCallback(
        (request: WindowRequest, appUrl: string, appName: string) => {
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
                nav.navigate(Routes.CONNECT_APP_SCREEN, {
                    request: {
                        type: "in-app",
                        initialRequest: req,
                        appUrl,
                        appName,
                    },
                })
            }
        },
        [connectedDiscoveryApps, nav, switchAccount, switchNetwork],
    )

    const validateTxMessage = useCallback(
        (request: WindowRequest, appUrl: string, appName: string) => {
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

    const navigateToCertificateScreen = useCallback(
        (request: WindowRequest, appUrl: string, appName: string) => {
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
                nav.navigate(Routes.CONNECT_APP_SCREEN, {
                    request: {
                        type: "in-app",
                        initialRequest: req,
                        appUrl,
                        appName,
                    },
                })
            }
        },
        [connectedDiscoveryApps, nav, switchAccount, switchNetwork],
    )

    const validateCertMessage = useCallback(
        (request: WindowRequest, appUrl: string, appName: string) => {
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
        },
        [dispatch, nav],
    )

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            debug(ERROR_EVENTS.DAPP, event.nativeEvent.url)

            if (!event.nativeEvent.data) {
                return
            }

            const data: WindowRequest = JSON.parse(event.nativeEvent.data)

            if (data.method === RequestMethods.REQUEST_TRANSACTION) {
                return validateTxMessage(data, event.nativeEvent.url, event.nativeEvent.title)
            } else if (data.method === RequestMethods.SIGN_CERTIFICATE) {
                return validateCertMessage(data, event.nativeEvent.url, event.nativeEvent.title)
            } else {
                warn(ERROR_EVENTS.DAPP, "Unknown method", event.nativeEvent)
            }
        },
        [validateTxMessage, validateCertMessage],
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

    const onScroll = useCallback(
        (event: NativeSyntheticEvent<Readonly<EnhancedScrollEvent>>) => {
            const { contentOffset: offset, layoutMeasurement, contentSize } = event.nativeEvent
            const direction = detectScrollDirection(offset)
            // Threshold to avoid the toolbars glitch when the scroll bounce
            const threshold = contentSize.height - layoutMeasurement.height - 1

            if (direction === ScrollDirection.DOWN && showToolbars) setShowToolbars(false)
            if (direction === ScrollDirection.UP && !showToolbars && offset.y <= threshold) setShowToolbars(true)
            if (offset.y === 0 || offset.y < 0) setShowToolbars(true)
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

    const contextValue = React.useMemo(() => {
        return {
            webviewRef,
            onMessage,
            onScroll,
            postMessage,
            injectVechainScript: injectedJs,
            onNavigationStateChange,
            navigationCanGoBack: nav.canGoBack(),
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
        }
    }, [
        onMessage,
        onScroll,
        postMessage,
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
    ])

    return <Context.Provider value={contextValue}>{children}</Context.Provider>
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

const injectedJs = `

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
        }
    },
}

true
`
