import { showErrorToast, showInfoToast } from "~Components"
import { useI18nContext } from "~i18n"
import { useCallback } from "react"
import { debug, error, WalletConnectUtils, warn } from "~Utils"
import { WalletConnectService } from "~Services"

export const useWcPairing = () => {
    const { LL } = useI18nContext()

    const onPair = useCallback(
        async (uri: string) => {
            debug("WalletConnectProvider:onPair", uri)

            const topic = WalletConnectUtils.getTopicFromPairUri(uri)
            debug("WalletConnectProvider:onPair - topic", topic)

            const activeSessions =
                await WalletConnectService.getActiveSessions()

            debug("WalletConnectProvider:onPair - web3Wallet")

            const existingSession = activeSessions[topic]

            if (existingSession) {
                debug("existingSession", existingSession)
                return
            }

            try {
                warn("WalletConnectProvider:onPair - pair")

                await WalletConnectService.pair(uri)

                warn("WalletConnectProvider:onPair - pair done")

                showInfoToast({
                    text1: LL.NOTIFICATION_warning_wallet_connect_connection_could_delay(),
                })
            } catch (err: unknown) {
                if (
                    err instanceof Error &&
                    err.message.includes("Pairing already exists")
                ) {
                    warn("Pairing already exists")
                    return
                }

                error("WalletConnectProvider:onPair - err", err)

                showErrorToast({
                    text1: LL.NOTIFICATION_wallet_connect_error_pairing(),
                })
            }
        },
        [LL],
    )

    const handleLinkingUrl = useCallback(
        async (url: string) => {
            if (typeof url !== "string") return

            try {
                let pairingUri

                debug(
                    "WalletConnectProvider:handleLinkingUrl",
                    WalletConnectUtils.isValidURI(url),
                )

                // Android
                if (WalletConnectUtils.isValidURI(url)) {
                    pairingUri = url
                } else {
                    // iOS
                    const iosUrl = new URL(url)
                    const wcUri = iosUrl.searchParams.get("uri")

                    if (wcUri) {
                        debug(
                            "WalletConnectProvider:handleLinkingUrl - wcUri",
                            wcUri,
                            WalletConnectUtils.isValidURI(wcUri),
                        )
                    }

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

    return {
        onPair,
        handleLinkingUrl,
    }
}
