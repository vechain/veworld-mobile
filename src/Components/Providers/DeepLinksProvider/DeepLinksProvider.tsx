import React, { useCallback, useEffect } from "react"
import { Linking } from "react-native"
import { ConnectionLinkParams } from "./types"

const parseUrl = (url: string) => {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const query = Object.fromEntries(urlObj.searchParams)
    return { path, query }
}

export const DeepLinksProvider = ({ children }: { children: React.ReactNode }) => {
    const handleConnectionLink = useCallback((_: ConnectionLinkParams) => {
        // console.log("connection link", params)
    }, [])

    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
            const { path, query } = parseUrl(url)
            if (path.endsWith("/connect")) {
                handleConnectionLink(query as ConnectionLinkParams)
            }
        }

        Linking.addEventListener("url", handleDeepLink)

        return () => Linking.removeAllListeners("url")
    }, [handleConnectionLink])

    return <>{children}</>
}
