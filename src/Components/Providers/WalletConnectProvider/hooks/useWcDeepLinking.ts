import { useCallback, useEffect, useState } from "react"
import { Linking } from "react-native"
import { error, WalletConnectUtils } from "~Utils"
import { WALLET_STATUS } from "~Model"
import { useApplicationSecurity } from "~Components"
import { ValidURI } from "~Utils/WalletConnectUtils/WalletConnectUtils"
import { ERROR_EVENTS } from "~Constants"

/**
 * @param pairingTopics - list of pairing topics from deep links
 */
type IUseWcDeepLinking = {
    pairingTopics: string[]
}

/**
 * useWcDeepLinking handles deeplinks which can be used to pair with a DApp
 *
 * If a valid deeplink is detected, the onPair is called
 *
 * @param onPair
 *
 * @returns IUseWcDeepLinking
 */

export const useWcDeepLinking = (onPair: (uri: string) => Promise<void>): IUseWcDeepLinking => {
    const [deepLinkUris, setDeepLinkUris] = useState<string[]>([])
    const [pairingTopics, setPairingTopics] = useState<string[]>([])
    const { walletStatus } = useApplicationSecurity()

    const pair = useCallback(
        (uri: string, validation: ValidURI) => {
            setPairingTopics(prev => {
                const { pairingTopic } = validation.params

                if (prev.includes(pairingTopic)) return prev

                return [...prev, pairingTopic]
            })

            onPair(uri)
        },
        [onPair],
    )

    const handleLinkingUrl = useCallback(
        async (url: string) => {
            if (typeof url !== "string") return

            try {
                // Android - Eg: wc://topic?relay-protocol=1234?symkey=1234
                const rawUri = WalletConnectUtils.validateUri(url)

                if (rawUri.isValid) {
                    return pair(url, rawUri)
                }

                // iOS - Eg: veworld//app.veworld?uri=wc%3A%2F%2Ftopic%3Frelay-protocol%3D1234%3Fsymkey%3D1234
                const deepLink = new URL(url)
                const wcUri = deepLink.searchParams.get("uri")

                const uriValidation = WalletConnectUtils.validateUri(wcUri)

                if (wcUri && uriValidation.isValid) {
                    return pair(wcUri, uriValidation)
                }
            } catch (e) {
                error(ERROR_EVENTS.WALLET_CONNECT, "WalletConnectProvider:handleLinkingUrl", e)
            }
        },
        [pair],
    )

    useEffect(() => {
        Linking.getInitialURL().then(url => {
            if (url) {
                setDeepLinkUris(prev => [...prev, url])
            }
        })
    }, [])

    /**
     * Sets up a listener for DApp session proposals
     * - Don't set any dependencies here, otherwise the listener will be added multiple times (there was trouble removing, screen crashes etc.)
     */
    useEffect(() => {
        Linking.addListener("url", event => {
            setDeepLinkUris(prev => [...prev, event.url])
        })
    }, [])

    useEffect(() => {
        if (deepLinkUris.length > 0 && walletStatus === WALLET_STATUS.UNLOCKED) {
            const firstUrl = deepLinkUris[0]

            setDeepLinkUris(prev => prev.filter(url => url !== firstUrl))

            handleLinkingUrl(firstUrl)
        }
    }, [walletStatus, handleLinkingUrl, setDeepLinkUris, deepLinkUris])

    return {
        pairingTopics,
    }
}
