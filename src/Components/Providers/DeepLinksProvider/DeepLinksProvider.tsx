import React, { useCallback, useEffect, useRef } from "react"
import { Linking } from "react-native"
import { ConnectionLinkParams, SignTransactionParams } from "./types"
import { useInteraction } from "../InteractionProvider"
// import { DeepLinkError } from "~Utils/ErrorMessageUtils"
// import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
// import { error } from "~Utils"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"
import { useBrowserTab } from "~Hooks/useBrowserTab"

type DeepLinkEvent = "discover" | "connect" | "singTransaction" | "signCertificate" | "signTypedData" | "disconnect"

type DiscoverURLRequest = {
    event: "discover"
    request: string
}

type DappURLRequest = {
    event: Exclude<DeepLinkEvent, "discover">
    request: Record<string, string>
}

const parseUrl = (url: string): DiscoverURLRequest | DappURLRequest => {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const destructuredPath = path.split("/")

    if (destructuredPath[0] === "discover") {
        return {
            event: "discover",
            request: decodeURIComponent(destructuredPath[destructuredPath.length - 1]),
        }
    }
    return {
        event: destructuredPath.pop() as Exclude<DeepLinkEvent, "discover">,
        request: Object.fromEntries(urlObj.searchParams),
    }
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

            switch (event) {
                case "discover":
                    navigateWithTab({ url: request, title: request, navigationFn: () => {} })
                    break
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
