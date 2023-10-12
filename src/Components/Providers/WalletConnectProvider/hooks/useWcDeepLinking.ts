import { useCallback, useEffect, useState } from "react"
import { Linking } from "react-native"
import { debug, error, WalletConnectUtils } from "~Utils"
import { WALLET_STATUS } from "~Model"
import { useApplicationSecurity } from "~Components"

export const useWcDeepLinking = (onPair: (uri: string) => Promise<void>) => {
    const [linkingUrls, setLinkingUrls] = useState<string[]>([])
    const { walletStatus } = useApplicationSecurity()

    const handleLinkingUrl = useCallback(
        async (url: string) => {
            if (typeof url !== "string") return

            try {
                let pairingUri

                // Android
                if (WalletConnectUtils.isValidURI(url)) {
                    pairingUri = url
                } else {
                    // iOS
                    const iosUrl = new URL(url)
                    const wcUri = iosUrl.searchParams.get("uri")

                    if (wcUri && WalletConnectUtils.isValidURI(wcUri)) {
                        pairingUri = wcUri
                    }
                }

                if (pairingUri) {
                    await onPair(pairingUri)
                }
            } catch (e) {
                error("WalletConnectProvider:handleLinkingUrl", e)
            }
        },
        [onPair],
    )

    useEffect(() => {
        Linking.getInitialURL().then(url => {
            debug("WalletConnectProvider:Linking.getInitialURL", url)
            if (url) {
                setLinkingUrls(prev => [...prev, url])
            }
        })
    }, [handleLinkingUrl])

    /**
     * Sets up a listener for DApp session proposals
     * - Don't set any dependencies here, otherwise the listener will be added multiple times (there was trouble removing, screen crashes etc.)
     */
    useEffect(() => {
        Linking.addListener("url", event => {
            debug("WalletConnectProvider:Linking.addListener", event)
            setLinkingUrls(prev => [...prev, event.url])
        })
    }, [])

    useEffect(() => {
        if (linkingUrls.length > 0 && walletStatus === WALLET_STATUS.UNLOCKED) {
            const firstUrl = linkingUrls[0]

            setLinkingUrls(prev => prev.filter(url => url !== firstUrl))

            handleLinkingUrl(firstUrl)
        }
    }, [walletStatus, handleLinkingUrl, linkingUrls])
}
