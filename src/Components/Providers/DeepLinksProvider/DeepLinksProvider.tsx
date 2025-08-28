import React, { useCallback, useEffect, useRef } from "react"
import { Linking } from "react-native"
import { ConnectionLinkParams, SignTransactionParams } from "./types"
import { useInteraction } from "../InteractionProvider"
// import { DeepLinkError } from "~Utils/ErrorMessageUtils"
// import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
// import { error } from "~Utils"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"
import { useBrowserTab } from "~Hooks/useBrowserTab"

const parseUrl = (url: string) => {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const request = Object.fromEntries(urlObj.searchParams)
    const event = path.split("/").pop()
    return { request, event }
}

export const DeepLinksProvider = ({ children }: { children: React.ReactNode }) => {
    const { navigateWithTab } = useBrowserTab()
    const mounted = useRef(false)
    const { setConnectBsData, connectBsRef, setTransactionBsData, transactionBsRef } = useInteraction()
    const { parseTransactionRequest } = useExternalDappConnection()

    const handleConnectionLink = useCallback(
        (params: ConnectionLinkParams) => {
            // console.log("connection link", params)
            setConnectBsData({
                type: "external-app",
                appName: params.app_name,
                appUrl: params.app_url ?? "",
                publicKey: params.public_key,
                redirectUrl: params.redirect_url ?? "",
                network: params.network,
                iconUrl: params.app_icon,
            })
            connectBsRef.current?.present()
        },
        [setConnectBsData, connectBsRef],
    )

    const handleSignTransaction = useCallback(
        async (params: SignTransactionParams) => {
            const request = await parseTransactionRequest(params.request)
            if (request) {
                setTransactionBsData(request)
                transactionBsRef.current?.present()
            }
        },
        [parseTransactionRequest, setTransactionBsData, transactionBsRef],
    )

    // const handleInvalidEvent = (redirectUrl: string) => {
    //     const err = new DeepLinkError(DeepLinkErrorCode.MethodNotFound)
    //     error("EXTERNAL_DAPP_CONNECTION", err)
    //     Linking.openURL(`${redirectUrl}?errorMessage=${err.message}&errorCode=${err.name}`)
    // }

    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
            const { event, request } = parseUrl(url)
            const parsed = new URL(url)
            const pathname = parsed.pathname
            //Filter out all the useless elements
            const splitPathname = pathname.split("/").filter(Boolean)
            switch (event) {
                case "discover": {
                    const lastElement = splitPathname[splitPathname.length - 1]
                    const decodedURI = decodeURIComponent(lastElement)
                    navigateWithTab({ url: decodedURI, title: decodedURI, navigationFn: () => {} })
                    break
                }
                case "connect":
                    handleConnectionLink(request as ConnectionLinkParams)
                    return
                case "singTransaction":
                    handleSignTransaction(request as SignTransactionParams)
                    return
                case "signCertificate":
                    return
                case "disconnect":
                    return
                default:
                    return
            }
        }

        Linking.addEventListener("url", handleDeepLink)

        if (!mounted.current) {
            mounted.current = true
            Linking.getInitialURL().then(url => url && handleDeepLink({ url }))
        }

        return () => {
            Linking.removeAllListeners("url")
        }
    }, [navigateWithTab, handleConnectionLink, handleSignTransaction])

    return <>{children}</>
}
