import React, { useCallback, useEffect } from "react"
import { Linking } from "react-native"
import { ConnectionLinkParams } from "./types"
import { useInteraction } from "../InteractionProvider"
import { DeepLinkError } from "~Utils/ErrorMessageUtils"
import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
import { error } from "~Utils"

const parseUrl = (url: string) => {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const request = Object.fromEntries(urlObj.searchParams)
    const event = path.split("/").pop()
    return { request, event }
}

export const DeepLinksProvider = ({ children }: { children: React.ReactNode }) => {
    const { setConnectBsData, connectBsRef } = useInteraction()

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

    const handleInvalidEvent = (redirectUrl: string) => {
        const err = new DeepLinkError(DeepLinkErrorCode.MethodNotFound)
        error("EXTERNAL_DAPP_CONNECTION", err)
        Linking.openURL(`${redirectUrl}?errorMessage=${err.message}&errorCode=${err.name}`)
    }

    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
            const { event, request } = parseUrl(url)
            switch (event) {
                case "connect":
                    handleConnectionLink(request as ConnectionLinkParams)
                    return
                case "singTransaction":
                    return
                default:
                    handleInvalidEvent(request.redirect_url)
                    return
            }
        }

        Linking.addEventListener("url", handleDeepLink)

        return () => Linking.removeAllListeners("url")
    }, [handleConnectionLink])

    return <>{children}</>
}
