import React, { useCallback, useRef } from "react"
import WebView, { WebViewMessageEvent } from "react-native-webview"
import { WindowRequest, WindowResponse } from "./types"
import { RequestMethods } from "~Constants"
import { useNavigation } from "@react-navigation/native"
import { DAppUtils, debug, warn } from "~Utils"
import { Routes } from "~Navigation"

type ContextType = {
    webviewRef: React.MutableRefObject<WebView | undefined>
    onMessage: (event: WebViewMessageEvent) => void
    postMessage: (message: WindowResponse) => void
    injectVechainScript: string
}

const Context = React.createContext<ContextType>({} as ContextType)

type Props = {
    children: React.ReactNode
}

export const InAppBrowserProvider = ({ children }: Props) => {
    const webviewRef = useRef<WebView | undefined>()
    const nav = useNavigation()

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
            debug("onMessage", event.nativeEvent, typeof event.nativeEvent.data)

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

    const contextValue = React.useMemo(() => {
        return {
            webviewRef,
            onMessage,
            postMessage,
            injectVechainScript: injectedJs,
        }
    }, [onMessage, postMessage, webviewRef])

    return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

export const useInAppBrowser = () => {
    return React.useContext(Context)
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

window.vechain = {
    isVeWorld: true,
    newConnexSigner: function (genesisId) {
        return {
            signTx(message, options) {
                const request = {
                    id:
                        Math.floor(Math.random() * (10000000 - 1000000 + 1)) +
                        1000000,
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
                    id:
                        Math.floor(Math.random() * (10000000 - 1000000 + 1)) +
                        1000000,
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
