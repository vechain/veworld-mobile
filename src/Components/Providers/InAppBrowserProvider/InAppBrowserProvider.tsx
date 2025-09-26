import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { ethers } from "ethers"
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
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { AnalyticsEvent, ERROR_EVENTS, RequestMethods } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, usePrevious, useSetSelectedAccount } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { useLoginSession } from "~Hooks/useLoginSession"
import { usePostWebviewMessage } from "~Hooks/usePostWebviewMessage"
import { Locales, useI18nContext } from "~i18n"
import {
    AccountWithDevice,
    CertificateRequest,
    InAppRequest,
    Network,
    SwitchWalletRequest,
    TransactionRequest,
    TypeDataRequest,
    WalletRequest,
} from "~Model"
import { Routes } from "~Navigation"
import {
    addSession,
    changeSelectedNetwork,
    deleteSession,
    selectAccounts,
    selectFeaturedDapps,
    selectNetworks,
    selectSelectedAccountAddress,
    selectSelectedAccountOrNull,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, AddressUtils, DAppUtils, debug, warn } from "~Utils"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { CertificateBottomSheet } from "./Components/CertificateBottomSheet"
import { ConnectBottomSheet } from "./Components/ConnectBottomSheet"
import { LoginBottomSheet } from "./Components/LoginBottomSheet/LoginBottomSheet"
import { SwitchWalletBottomSheet } from "./Components/SwitchWalletBottomSheet"
import { TransactionBottomSheet } from "./Components/TransactionBottomSheet/TransactionBottomSheet"
import { TypedDataBottomSheet } from "./Components/TypedDataBottomSheet"
import {
    CertRequest,
    LoginRequest,
    LoginRequestTypedData,
    SignedDataRequest,
    TxRequest,
    WindowRequest,
    WindowResponse,
} from "./types"
import { getLoginKind } from "./Utils/LoginUtils"
import { DisconnectBottomSheet } from "./Components/DisconnectBottomSheet"

const { PackageDetails } = NativeModules

export interface PackageInfoResponse {
    packageName: string
    versionName: string
    versionCode: number
    verificationFailed: boolean
}

export interface DappMetadata {
    icon: string
    name: string
    url: string
    isDapp: boolean
    description?: string
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
    dappMetadata?: DappMetadata
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
    const {
        certificateBsRef,
        setCertificateBsData,
        transactionBsRef,
        setTransactionBsData,
        typedDataBsRef,
        setTypedDataBsData,
        loginBsRef,
        setLoginBsData,
        switchWalletBsRef,
        setSwitchWalletBsData,
    } = useInteraction()

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
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

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
    const { getLoginSession } = useLoginSession()

    const fetchDynamicAppLogo = useDynamicAppLogo({ size: 64 })

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

    const postWebviewMessage = usePostWebviewMessage(webviewRef)

    const [navigationState, setNavigationState] = useState<WebViewNavigation | undefined>(undefined)
    const previousUrl = usePrevious(navigationState?.url)

    const canGoBack = useMemo(() => {
        return navigationState?.canGoBack ?? false
    }, [navigationState])

    const canGoForward = useMemo(() => {
        return navigationState?.canGoForward ?? false
    }, [navigationState])

    const postMessage = useCallback(
        (message: WindowResponse) => {
            debug(ERROR_EVENTS.DAPP, "responding to dapp request", message.id)

            postWebviewMessage(message)

            /**
             * Track the success / failure rates against the dapp URL
             */
            let analyticEvent: AnalyticsEvent | undefined

            if (message.method === RequestMethods.REQUEST_TRANSACTION) {
                if ("error" in message) {
                    analyticEvent = AnalyticsEvent.DISCOVERY_TRANSACTION_ERROR
                } else {
                    analyticEvent = AnalyticsEvent.DISCOVERY_TRANSACTION_SUCCESS
                }
            }

            if (message.method === RequestMethods.SIGN_CERTIFICATE) {
                if ("error" in message) {
                    analyticEvent = AnalyticsEvent.DISCOVERY_CERTIFICATE_ERROR
                } else {
                    analyticEvent = AnalyticsEvent.DISCOVERY_CERTIFICATE_SUCCESS
                }
            }

            if (message.method === RequestMethods.SIGN_TYPED_DATA) {
                if ("error" in message) {
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
        [navigationState, postWebviewMessage, track],
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
            if (!("options" in request)) return
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
            if (
                !("options" in request) ||
                !request.options.signer ||
                compareAddresses(selectedAccountAddress, request.options.signer)
            ) {
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

            const session = getLoginSession(appUrl, request.genesisId)

            if (!session && request.options.signer)
                dispatch(
                    addSession({
                        address: request.options.signer,
                        genesisId: request.genesisId,
                        kind: "temporary",
                        url: appUrl,
                        name: appName,
                    }),
                )

            const req: TransactionRequest = {
                method: request.method,
                id: request.id,
                type: "in-app",
                message: message,
                options: request.options,
                appUrl,
                appName,
            }

            setTransactionBsData(req)
            transactionBsRef.current?.present()
        },
        [dispatch, getLoginSession, setTransactionBsData, switchAccount, switchNetwork, transactionBsRef],
    )

    const navigateToCertificateScreen = useCallback(
        (request: CertRequest, appUrl: string, appName: string) => {
            try {
                switchAccount(request)
                switchNetwork(request)
            } catch {
                return
            }

            const session = getLoginSession(appUrl, request.genesisId)

            if (!session && request.options.signer)
                dispatch(
                    addSession({
                        address: request.options.signer,
                        genesisId: request.genesisId,
                        kind: "temporary",
                        url: appUrl,
                        name: appName,
                    }),
                )

            const message = request.message as Connex.Vendor.CertMessage

            const req: CertificateRequest = {
                method: request.method,
                id: request.id,
                type: "in-app",
                message: message,
                options: request.options,
                appUrl,
                appName,
            }

            setCertificateBsData(req)
            certificateBsRef.current?.present()
        },
        [getLoginSession, dispatch, setCertificateBsData, certificateBsRef, switchAccount, switchNetwork],
    )

    const navigateToSignedDataScreen = useCallback(
        (request: SignedDataRequest, appUrl: string, appName: string) => {
            try {
                switchAccount(request)
                switchNetwork(request)
            } catch {
                return
            }

            const session = getLoginSession(appUrl, request.genesisId)

            if (!session && request.options.signer)
                dispatch(
                    addSession({
                        address: request.options.signer,
                        genesisId: request.genesisId,
                        kind: "temporary",
                        url: appUrl,
                        name: appName,
                    }),
                )

            const req: TypeDataRequest = {
                method: request.method,
                id: request.id,
                type: "in-app",
                options: request.options,
                appUrl,
                appName,
                domain: request.domain,
                types: request.types,
                value: request.value,
                origin: request.origin,
            }

            setTypedDataBsData(req)
            typedDataBsRef.current?.present()
        },
        [dispatch, getLoginSession, setTypedDataBsData, switchAccount, switchNetwork, typedDataBsRef],
    )

    const navigateToLoginScreen = useCallback(
        (request: LoginRequest, appUrl: string, appName: string) => {
            try {
                switchAccount(request)
                switchNetwork(request)
            } catch {
                return
            }

            const kind = getLoginKind(request)

            setLoginBsData({
                appName,
                appUrl,
                type: "in-app",
                value: request.params.value,
                external: request.params.external,
                method: RequestMethods.CONNECT,
                kind: kind as any,
                id: request.id,
                genesisId: request.genesisId,
            })
            loginBsRef.current?.present()
        },
        [loginBsRef, setLoginBsData, switchAccount, switchNetwork],
    )

    /**
     * Validate an old request (sign tx/sign cert/sign typed data) to check for sessions.
     * @returns true if it's invalid, false otherwise
     */
    const checkIfOldRequestIsInvalid = useCallback(
        (
            request: TxRequest | CertRequest | SignedDataRequest,
            appUrl: string,
            method: (typeof RequestMethods)[keyof typeof RequestMethods],
        ) => {
            const loginSession = getLoginSession(appUrl, request.genesisId)
            if (!loginSession) return false
            if (loginSession.kind === "permanent") return false
            if (!request.options.signer) return false
            if (!AddressUtils.compareAddresses(request.options.signer, loginSession.address)) {
                postMessage({
                    id: request.id,
                    error: "Invalid request. Request signer is different from the session signer.",
                    method,
                })
                return true
            }
            return false
        },
        [getLoginSession, postMessage],
    )

    // ~ MESSAGE VALIDATION
    const validateTxMessage = useCallback(
        (request: TxRequest, appUrl: string, appName: string) => {
            const message = request.message

            track(AnalyticsEvent.DISCOVERY_TRANSACTION_REQUESTED, {
                dapp: new URL(appUrl).origin,
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

            const res = checkIfOldRequestIsInvalid(request, appUrl, RequestMethods.REQUEST_TRANSACTION)
            if (res) return
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
            checkIfOldRequestIsInvalid,
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
                dapp: new URL(appUrl).origin,
            })

            const isValid = DAppUtils.isValidCertMessage(message)

            if (!isValid) {
                return postMessage({
                    id: request.id,
                    error: "Invalid certificate message",
                    method: RequestMethods.SIGN_CERTIFICATE,
                })
            }

            const res = checkIfOldRequestIsInvalid(request, appUrl, RequestMethods.SIGN_CERTIFICATE)
            if (res) return

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
            checkIfOldRequestIsInvalid,
            initAndOpenChangeAccountNetworkBottomSheet,
            navigateToCertificateScreen,
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
                dapp: new URL(appUrl).origin,
            })

            if (!isValid) {
                return postMessage({
                    id: request.id,
                    error: "Invalid signed data message",
                    method: RequestMethods.SIGN_TYPED_DATA,
                })
            }

            const res = checkIfOldRequestIsInvalid(request, appUrl, RequestMethods.SIGN_TYPED_DATA)
            if (res) return

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
            checkIfOldRequestIsInvalid,
            initAndOpenChangeAccountNetworkBottomSheet,
            navigateToSignedDataScreen,
            postMessage,
            selectedAccountAddress,
            selectedNetwork.genesis.id,
            track,
        ],
    )

    const validateConnectMessage = useCallback(
        (request: LoginRequest, appUrl: string, appName: string) => {
            track(AnalyticsEvent.DAPP_LOGIN_REQUESTED, { kind: getLoginKind(request), dapp: new URL(appUrl).origin })
            if (request.params.value === null) {
                //Handle login without anything
                if (selectedNetwork.genesis.id.toLowerCase() === request.genesisId.toLowerCase()) {
                    return navigateToLoginScreen(request, appUrl, appName)
                }

                setNavigateToOperation(() => () => navigateToLoginScreen(request, appUrl, appName))
                initAndOpenChangeAccountNetworkBottomSheet(request)
                return
            } else if ("purpose" in request.params.value) {
                //Certificate message
                //We can safely assume that if the key `purpose` in the parameters value, given that the typed-data message doesn't have it, it's 100% a certificate message
                const isValid = DAppUtils.isValidCertMessage(request.params.value)
                if (!isValid) {
                    return postMessage({
                        id: request.id,
                        error: "Invalid certificate message for connecting",
                        method: RequestMethods.CONNECT,
                    })
                }
                if (request.params.value.purpose !== "identification") {
                    return postMessage({
                        id: request.id,
                        error: "Invalid purpose in certificate message for connecting",
                        method: RequestMethods.CONNECT,
                    })
                }
            } else if ("domain" in request.params.value) {
                //Sign typed data message
                const isValid = DAppUtils.isValidSignedData(request.params.value)
                if (!isValid) {
                    return postMessage({
                        id: request.id,
                        error: "Invalid typed data message for connecting",
                        method: RequestMethods.CONNECT,
                    })
                }
                const reqValue = (request as LoginRequestTypedData).params.value.value
                if (
                    "veworld_login_address" in reqValue &&
                    reqValue.veworld_login_address !== ethers.constants.AddressZero
                ) {
                    return postMessage({
                        id: request.id,
                        error: "Invalid veworld_login_address default value in typed data message for connecting",
                        method: RequestMethods.CONNECT,
                    })
                }
            }

            if (selectedNetwork.genesis.id.toLowerCase() === request.genesisId.toLowerCase()) {
                return navigateToLoginScreen(request, appUrl, appName)
            }

            setNavigateToOperation(() => () => navigateToLoginScreen(request, appUrl, appName))
            initAndOpenChangeAccountNetworkBottomSheet(request)
        },
        [
            initAndOpenChangeAccountNetworkBottomSheet,
            navigateToLoginScreen,
            postMessage,
            selectedNetwork.genesis.id,
            track,
        ],
    )

    const addAppAndNavToRequest = useCallback(
        (request: InAppRequest) => {
            if (request.method === "thor_sendTransaction") {
                setTransactionBsData(request)
                transactionBsRef.current?.present()
            }

            if (request.method === "thor_signCertificate") {
                setCertificateBsData(request)
                certificateBsRef.current?.present()
            }

            if (request.method === "thor_signTypedData") {
                setTypedDataBsData(request)
                typedDataBsRef.current?.present()
            }
        },
        [
            certificateBsRef,
            setCertificateBsData,
            setTransactionBsData,
            setTypedDataBsData,
            transactionBsRef,
            typedDataBsRef,
        ],
    )

    const executeWalletMessage = useCallback(
        (request: WalletRequest, appUrl: string, appName: string) => {
            try {
                switchNetwork(request)
            } catch {
                return
            }
            const loginSession = getLoginSession(appUrl, request.genesisId)
            if (!loginSession)
                return postMessage({
                    id: request.id,
                    method: RequestMethods.WALLET,
                    data: null,
                })
            if (loginSession.kind === "external")
                return postMessage({
                    id: request.id,
                    method: RequestMethods.WALLET,
                    data: loginSession.address,
                })
            if (loginSession.kind === "permanent") {
                if (AccountUtils.isObservedAccount(selectedAccount)) {
                    setSwitchWalletBsData({
                        appName,
                        appUrl,
                        genesisId: request.genesisId,
                        id: request.id,
                        method: "thor_switchWallet",
                        type: "in-app",
                    })
                    switchWalletBsRef.current?.present()
                    return
                }
                return postMessage({
                    id: request.id,
                    method: RequestMethods.WALLET,
                    data: selectedAccountAddress ?? null,
                })
            }
            if (loginSession.kind === "temporary")
                return postMessage({
                    id: request.id,
                    method: RequestMethods.WALLET,
                    data: loginSession.address,
                })
        },
        [
            getLoginSession,
            postMessage,
            selectedAccount,
            selectedAccountAddress,
            setSwitchWalletBsData,
            switchNetwork,
            switchWalletBsRef,
        ],
    )

    const validateWalletMessage = useCallback(
        (request: WalletRequest, appUrl: string, appName: string) => {
            if (selectedNetwork.genesis.id.toLowerCase() === request.genesisId.toLowerCase()) {
                return executeWalletMessage(request, appUrl, appName)
            }

            setNavigateToOperation(() => () => executeWalletMessage(request, appUrl, appName))
            initAndOpenChangeAccountNetworkBottomSheet(request)
        },
        [executeWalletMessage, initAndOpenChangeAccountNetworkBottomSheet, selectedNetwork.genesis.id],
    )

    const validateDisconnectMessage = useCallback(
        (request: { id: string; genesisId: string }, appUrl: string) => {
            const loginSession = getLoginSession(appUrl, request.genesisId)
            if (loginSession) dispatch(deleteSession(loginSession.url))
            postMessage({
                id: request.id,
                method: RequestMethods.DISCONNECT,
                data: null,
            })
        },
        [dispatch, getLoginSession, postMessage],
    )

    const validateMethodsMessage = useCallback(
        (request: { id: string; genesisId: string }, appUrl: string) => {
            const session = getLoginSession(appUrl, request.genesisId)
            if (session?.kind === "permanent") {
                return postMessage({
                    id: request.id,
                    method: RequestMethods.METHODS,
                    data: Object.values(RequestMethods).filter(value => {
                        // personal_sign isn't supported at all
                        return value !== "personal_sign"
                    }),
                })
            }
            //thor_switchWallet only works for permanent sessions, so it doesn't make sense to send it if does nothing
            return postMessage({
                id: request.id,
                method: RequestMethods.METHODS,
                data: Object.values(RequestMethods).filter(value => {
                    // personal_sign isn't supported at all
                    return value !== "personal_sign" && value !== "thor_switchWallet"
                }),
            })
        },
        [getLoginSession, postMessage],
    )

    const executeSwitchWalletMessage = useCallback(
        (request: SwitchWalletRequest, appUrl: string, appName: string) => {
            try {
                switchNetwork(request)
            } catch {
                return
            }
            const loginSession = getLoginSession(appUrl, request.genesisId)
            if (!loginSession || loginSession.kind !== "permanent")
                return postMessage({
                    id: request.id,
                    error: "User cannot switch wallet",
                    method: RequestMethods.SWITCH_WALLET,
                })
            setSwitchWalletBsData({
                appName,
                appUrl,
                genesisId: request.genesisId,
                id: request.id,
                method: "thor_switchWallet",
                type: "in-app",
            })
            switchWalletBsRef.current?.present()
        },
        [getLoginSession, postMessage, setSwitchWalletBsData, switchNetwork, switchWalletBsRef],
    )

    const validateSwitchWalletMessage = useCallback(
        (request: SwitchWalletRequest, appUrl: string, appName: string) => {
            if (selectedNetwork.genesis.id.toLowerCase() === request.genesisId.toLowerCase()) {
                return executeSwitchWalletMessage(request, appUrl, appName)
            }

            setNavigateToOperation(() => () => executeSwitchWalletMessage(request, appUrl, appName))
            initAndOpenChangeAccountNetworkBottomSheet(request)
        },
        [executeSwitchWalletMessage, initAndOpenChangeAccountNetworkBottomSheet, selectedNetwork.genesis.id],
    )

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            debug(ERROR_EVENTS.DAPP, event.nativeEvent.url)

            if (!event.nativeEvent.data) {
                return
            }

            const data = JSON.parse(event.nativeEvent.data)

            switch (data.method) {
                case RequestMethods.REQUEST_TRANSACTION:
                    if (data.requestAPI)
                        return validateTxMessage(
                            {
                                genesisId: data.genesisId,
                                id: data.id,
                                message: data.params.clauses,
                                method: RequestMethods.REQUEST_TRANSACTION,
                                options: data.params.options,
                            },
                            event.nativeEvent.url,
                            event.nativeEvent.title,
                        )
                    return validateTxMessage(data, event.nativeEvent.url, event.nativeEvent.title)
                case RequestMethods.SIGN_CERTIFICATE:
                    if (data.requestAPI)
                        return validateCertMessage(
                            {
                                genesisId: data.genesisId,
                                id: data.id,
                                message: data.params.message,
                                method: RequestMethods.SIGN_CERTIFICATE,
                                options: data.params.options,
                            },
                            event.nativeEvent.url,
                            event.nativeEvent.title,
                        )
                    return validateCertMessage(data, event.nativeEvent.url, event.nativeEvent.title)
                case RequestMethods.SIGN_TYPED_DATA:
                    if (data.requestAPI)
                        return validateSignedDataMessage(
                            {
                                genesisId: data.genesisId,
                                id: data.id,
                                domain: data.params.domain,
                                method: RequestMethods.SIGN_TYPED_DATA,
                                options: data.params.options,
                                origin: data.origin,
                                types: data.params.types,
                                value: data.params.value,
                            },
                            event.nativeEvent.url,
                            event.nativeEvent.title,
                        )
                    return validateSignedDataMessage(data, event.nativeEvent.url, event.nativeEvent.title)
                case RequestMethods.CONNECT:
                    return validateConnectMessage(data, event.nativeEvent.url, event.nativeEvent.title)
                case RequestMethods.WALLET:
                    return validateWalletMessage(data, event.nativeEvent.url, event.nativeEvent.title)
                case RequestMethods.DISCONNECT:
                    return validateDisconnectMessage(data, event.nativeEvent.url)
                case RequestMethods.METHODS:
                    return validateMethodsMessage(data, event.nativeEvent.url)
                case RequestMethods.SWITCH_WALLET:
                    return validateSwitchWalletMessage(data, event.nativeEvent.url, event.nativeEvent.title)
                default:
                    warn(ERROR_EVENTS.DAPP, "Unknown method", event.nativeEvent)
                    if (data.id)
                        return postMessage({
                            id: data.id,
                            error: "Unknown method called",
                            method: data.method ?? "UNKNOWN_METHOD",
                        })
            }
        },
        [
            validateTxMessage,
            validateCertMessage,
            validateSignedDataMessage,
            validateConnectMessage,
            validateWalletMessage,
            validateDisconnectMessage,
            validateMethodsMessage,
            validateSwitchWalletMessage,
            postMessage,
        ],
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

    const onNavigationStateChange = useCallback(
        (navState: WebViewNavigation) => {
            setNavigationState(navState)
            if (previousUrl !== navState.url) {
                setShowToolbars(true)
            }
        },
        [previousUrl],
    )

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

    const dappMetadata = useMemo(() => {
        if (!navigationState?.url) return undefined

        const foundDapp = allDapps.find(app => new URL(app.href).origin === new URL(navigationState?.url ?? "").origin)
        if (foundDapp)
            return {
                icon: fetchDynamicAppLogo({ app: foundDapp }),
                name: foundDapp.name,
                url: navigationState?.url,
                isDapp: true,
                description: foundDapp.desc,
            }

        return {
            name: new URL(navigationState?.url ?? "").hostname,
            url: navigationState?.url,
            icon: DAppUtils.generateFaviconUrl(navigationState.url),
            isDapp: false,
        }
    }, [allDapps, fetchDynamicAppLogo, navigationState?.url])

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
            getLoginSession,
            dappMetadata,
        }
    }, [
        isLoading,
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
        isDapp,
        locale,
        packageInfo,
        getLoginSession,
        dappMetadata,
    ])

    return (
        <Context.Provider value={contextValue}>
            <ConnectBottomSheet />
            <DisconnectBottomSheet />
            <CertificateBottomSheet />
            <TransactionBottomSheet />
            <TypedDataBottomSheet />
            <LoginBottomSheet />
            <SwitchWalletBottomSheet />
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

export const useInAppBrowserOrNull = () => {
    const context = useContext(Context)

    return context ?? null
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
    send: function (params) {
        const request = {
            id: generateRandomId(),
            method: params.method,
            origin: window.origin,
            params: params.params,
            genesisId: params.genesisId,
            requestAPI: true
        }

        window.ReactNativeWebView.postMessage(JSON.stringify(request))

        return newResponseHandler(request.id)
    }
}

true
`
    return script
}
