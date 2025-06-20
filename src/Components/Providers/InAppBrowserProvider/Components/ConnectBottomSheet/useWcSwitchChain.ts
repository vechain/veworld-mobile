import { useEffect } from "react"
import { showInfoToast } from "~Components/Base"
import { useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { useI18nContext } from "~i18n"
import { ConnectAppRequest } from "~Model"
import { changeSelectedNetwork, selectNetworks, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { HexUtils } from "~Utils"

export const useWcSwitchChain = (request: ConnectAppRequest, { onCloseBs }: { onCloseBs: () => void }) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const networks = useAppSelector(selectNetworks)
    const { activeSessions } = useWalletConnect()
    /**
     * If the dApp requests ONLY one chain, switch to that chain
     */
    useEffect(() => {
        if (request.type !== "wallet-connect") return

        if (!request.proposal.params.requiredNamespaces.vechain) return

        const chains = request.proposal.params.requiredNamespaces.vechain.chains

        if (chains && chains.length === 1) {
            const requestedChain = chains[0]

            const requestedNetwork = networks.find(net =>
                HexUtils.compare(net.genesis.id.slice(-32), requestedChain.split(":")[1]),
            )

            if (requestedNetwork) {
                dispatch(changeSelectedNetwork(requestedNetwork))
                showInfoToast({
                    text1: LL.NOTIFICATION_WC_NETWORK_CHANGED({
                        network: requestedNetwork.name,
                    }),
                })
            }
        }
    }, [LL, dispatch, networks, request])

    /**
     * Navigates back if we have already processed the request
     */
    useEffect(() => {
        if (request.type !== "wallet-connect") return
        const sessions = Object.values(activeSessions)

        if (sessions.some(_session => _session.pairingTopic === request.proposal.params.pairingTopic)) {
            onCloseBs()
        }
    }, [request, activeSessions, onCloseBs])
}
