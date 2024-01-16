import { useCallback, useMemo } from "react"
import { debug, error, WalletConnectUtils } from "~Utils"
import { showErrorToast, showInfoToast } from "~Components"
import { useI18nContext } from "~i18n"
import { SessionTypes } from "@walletconnect/types"
import { ERROR_EVENTS } from "~Constants"

export const useWcPairing = (activeSessions: Record<string, SessionTypes.Struct>) => {
    const { LL } = useI18nContext()

    const activeSessionsFlat = useMemo(() => Object.values(activeSessions), [activeSessions])

    /**
     * A pairing between the DApp and the wallet needs to be established in order to make
     * them communicate through the Wallet Connect Relay Server. This is done by generating
     * a QR code on the DApp (containing a URI) and by scanning it with the mobile wallet.
     *
     * After a pairing is established the DApp will be able to send a session_proposal
     * to the wallet asking for permission to connect and create a session.
     */
    const onPair = useCallback(
        async (uri: string) => {
            debug(ERROR_EVENTS.WALLET_CONNECT, "WalletConnectProvider:onPair", uri)

            const topic = WalletConnectUtils.getTopicFromPairUri(uri)

            if (activeSessionsFlat.some(s => s.topic === topic)) {
                return
            }

            try {
                const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

                await web3Wallet?.core.pairing.pair({
                    uri,
                    activatePairing: true,
                })

                showInfoToast({
                    text1: LL.NOTIFICATION_warning_wallet_connect_connection_could_delay(),
                })
            } catch (err: unknown) {
                if (err instanceof Error && err.message.includes("Pairing already exists")) {
                    return
                }

                error(ERROR_EVENTS.WALLET_CONNECT, "WalletConnectProvider:onPair - err", err)

                showErrorToast({
                    text1: LL.NOTIFICATION_wallet_connect_error_pairing(),
                })
            }
        },
        [activeSessionsFlat, LL],
    )

    return {
        onPair,
    }
}
