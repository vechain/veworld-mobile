import React, { useCallback, useContext, useMemo, useRef } from "react"
import WebView, { WebViewMessageEvent, WebViewNavigation } from "react-native-webview"
import { WindowRequest, WindowResponse } from "./types"
import { RequestMethods } from "~Constants"
import { useNavigation } from "@react-navigation/native"
import { DAppUtils, debug, warn } from "~Utils"
import { Routes } from "~Navigation"

type ContextType = {
    webviewRef: React.MutableRefObject<WebView | undefined>
    onMessage: (event: WebViewMessageEvent) => void
    postMessage: (message: WindowResponse) => void
    onNavigationStateChange: (navState: WebViewNavigation) => void
    injectVechainScript: string
    canGoBack: boolean
    canGoForward: boolean
    goBack: () => void
    goForward: () => void
    goHome: () => void
    navigateToUrl: (url: string) => void
    navigationState: WebViewNavigation | undefined
    resetWebViewState: () => void
}

const Context = React.createContext<ContextType | undefined>(undefined)

type Props = {
    children: React.ReactNode
}

export const DISCOVER_HOME_URL = "https://apps.vechain.org/#all"

export const InAppBrowserProvider = ({ children }: Props) => {
    const nav = useNavigation()

    const webviewRef = useRef<WebView | undefined>()

    const [navigationState, setNavigationState] = React.useState<WebViewNavigation | undefined>(undefined)

    const canGoBack = useMemo(() => {
        return navigationState?.canGoBack ?? false
    }, [navigationState])

    const canGoForward = useMemo(() => {
        return navigationState?.canGoForward ?? false
    }, [navigationState])

    const postMessage = useCallback((message: WindowResponse) => {
        debug("responding to dapp request", message.id)

        webviewRef.current?.injectJavaScript(
            `
                setTimeout(function() { 
                   postMessage(${JSON.stringify(message)}, "*")
                }, 1);
                `,
        )
    }, [])

    const navigateToUrl = useCallback((url: string) => {
        // Check if the URL starts with 'http://' or 'https://'
        const hasProtocol = /^https?:\/\//i.test(url)
        const finalUrl = hasProtocol ? url : `http://${url}`

        webviewRef.current?.injectJavaScript(`
            window.location.href = "${finalUrl}"
        `)
    }, [])

    const navigateToTransactionScreen = useCallback(
        (request: WindowRequest, event: WebViewMessageEvent) => {
            const message = request.message

            const isValid = DAppUtils.isValidTxMessage(message)

            if (!isValid) {
                return postMessage({
                    id: request.id,
                    error: "Invalid transaction",
                })
            }

            nav.navigate(Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN, {
                request: {
                    id: request.id,
                    type: "in-app",
                    message: message,
                    options: request.options,
                    appUrl: event.nativeEvent.url,
                    appName: event.nativeEvent.title,
                },
            })
        },
        [nav, postMessage],
    )

    const navigateToCertificateScreen = useCallback(
        (request: WindowRequest, event: WebViewMessageEvent) => {
            const message = request.message

            const isValid = DAppUtils.isValidCertMessage(message)

            if (!isValid) {
                return postMessage({
                    id: request.id,
                    error: "Invalid certificate message",
                })
            }

            nav.navigate(Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN, {
                request: {
                    id: request.id,
                    type: "in-app",
                    message: message,
                    options: request.options,
                    appUrl: event.nativeEvent.url,
                    appName: event.nativeEvent.title,
                },
            })
        },
        [nav, postMessage],
    )

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            debug("onMessage", event.nativeEvent.url)

            if (!event.nativeEvent.data) {
                return
            }

            const data: WindowRequest = JSON.parse(event.nativeEvent.data)

            if (data.method === RequestMethods.REQUEST_TRANSACTION) {
                return navigateToTransactionScreen(data, event)
            } else if (data.method === RequestMethods.SIGN_CERTIFICATE) {
                return navigateToCertificateScreen(data, event)
            } else {
                warn("Unknown method", event.nativeEvent)
            }
        },
        [navigateToTransactionScreen, navigateToCertificateScreen],
    )

    const onNavigationStateChange = useCallback((navState: WebViewNavigation) => {
        setNavigationState(navState)
    }, [])

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
        warn("resetting webview state")
        setNavigationState(undefined)
        webviewRef.current = undefined
    }, [])

    const contextValue = React.useMemo(() => {
        return {
            webviewRef,
            onMessage,
            postMessage,
            injectVechainScript: injectedJs,
            onNavigationStateChange,
            canGoBack,
            canGoForward,
            goBack,
            goForward,
            navigateToUrl,
            goHome,
            navigationState,
            resetWebViewState,
        }
    }, [
        onNavigationStateChange,
        onMessage,
        postMessage,
        webviewRef,
        canGoBack,
        canGoForward,
        goBack,
        goForward,
        navigateToUrl,
        goHome,
        navigationState,
        resetWebViewState,
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
