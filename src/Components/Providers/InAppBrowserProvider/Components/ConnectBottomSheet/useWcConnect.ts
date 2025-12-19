import { ProposalTypes, SessionTypes } from "@walletconnect/types"
import { useCallback, useMemo, useState } from "react"
import { showErrorToast } from "~Components/Base"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { ERROR_EVENTS } from "~Constants"
import { useI18nContext } from "~i18n"
import { ConnectAppRequest } from "~Model"
import {
    addConnectedAppActivity,
    selectNetworks,
    selectSelectedAccountOrNull,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, warn } from "~Utils"
import { distinctValues } from "~Utils/ArrayUtils"

export const useWcConnect = ({ onCloseBs }: { onCloseBs: () => void }) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const networks = useAppSelector(selectNetworks)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const { approvePendingProposal } = useWalletConnect()
    const [isLoading, setIsLoading] = useState(false)

    /**
     * Handle session proposal
     */
    const processProposal = useCallback(
        async (request: Extract<ConnectAppRequest, { type: "wallet-connect" }>) => {
            const { params } = request.proposal

            const namespaces: SessionTypes.Namespaces = {}

            const addNamespaces = (proposedNamespaces: Record<string, ProposalTypes.BaseRequiredNamespace>) => {
                for (const key of Object.keys(proposedNamespaces)) {
                    warn(ERROR_EVENTS.WALLET_CONNECT, proposedNamespaces[key])

                    const _chains =
                        proposedNamespaces[key].chains ??
                        networks.map(network => `vechain:${network.genesis.id.slice(-32)}`)

                    const accounts = _chains.map((scope: string) => {
                        return `${scope}:${selectedAccount!.address}`
                    })

                    if (namespaces[key]) {
                        namespaces[key] = {
                            methods: distinctValues([...namespaces[key].methods, ...proposedNamespaces[key].methods]),
                            events: distinctValues([...namespaces[key].events, ...proposedNamespaces[key].events]),
                            accounts: distinctValues([...namespaces[key].accounts, ...accounts]),
                        }
                    } else {
                        namespaces[key] = {
                            methods: proposedNamespaces[key].methods,
                            events: proposedNamespaces[key].events,
                            accounts,
                        }
                    }
                }
            }

            addNamespaces(params.requiredNamespaces)
            addNamespaces(params.optionalNamespaces)

            setIsLoading(true)

            try {
                await approvePendingProposal(request.proposal, namespaces)

                dispatch(addConnectedAppActivity(request.appName, new URL(request.appUrl).origin, request.description))

                Feedback.show({
                    message: LL.FEEDBACK_APP_CONNECTED(),
                    type: FeedbackType.ALERT,
                    severity: FeedbackSeverity.SUCCESS,
                })
            } catch (err: unknown) {
                error(ERROR_EVENTS.WALLET_CONNECT, err)
                showErrorToast({
                    text1: LL.NOTIFICATION_wallet_connect_error_pairing(),
                })
            } finally {
                onCloseBs()
            }
        },
        [dispatch, networks, selectedAccount, approvePendingProposal, LL, onCloseBs],
    )

    const memoized = useMemo(() => ({ processProposal, isLoading, setIsLoading }), [isLoading, processProposal])

    return memoized
}
