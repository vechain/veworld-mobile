import { useCallback } from "react"
import {
    ProposalTypes,
    SessionTypes,
    SignClientTypes,
} from "@walletconnect/types"
import { error, WalletConnectUtils, warn } from "~Utils"
import { showErrorToast } from "~Components"
import {
    selectNetworks,
    selectSelectedAccount,
    useAppDispatch,
    useAppSelector,
    WalletConnectPendingSession,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { getSdkError } from "@walletconnect/utils"
import { approveSession } from "~Components/Providers/WalletConnectProviderV2/helpers/WCProcessors"

export const useWcProposal = (sessionProposal: WalletConnectPendingSession) => {
    const { LL } = useI18nContext()
    const networks = useAppSelector(selectNetworks)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const nav = useNavigation()
    const dispatch = useAppDispatch()

    const processProposal = useCallback(async () => {
        const requiredNamespaces: ProposalTypes.RequiredNamespaces =
            sessionProposal.proposalNamespaces

        if (!sessionProposal || !requiredNamespaces.vechain.chains) {
            warn("ConnectedAppScreen - session not valid")
            showErrorToast({
                text1: LL.NOTIFICATION_wallet_connect_error_pairing(),
            })
            return
        }

        // Setup vechain namespaces to return to the dapp
        const namespaces: SessionTypes.Namespaces = {}
        const connectedAccounts: string[] = []
        const networkIdentifiers = networks.map(network =>
            network.genesis.id.slice(-32),
        )

        const _networks =
            requiredNamespaces.vechain.chains ??
            networks.map(network => `vechain:${network.genesis.id.slice(-32)}`)

        _networks.map((scope: string) => {
            // Valid only for supported networks
            // scope example: vechain:b1ac3413d346d43539627e6be7ec1b4a, vechain:87721b09ed2e15997f466536b20bb127
            const network = scope.split(":")[1]

            if (networkIdentifiers.includes(network)) {
                connectedAccounts.push(`${scope}:${selectedAccount.address}`)
            }
        })

        namespaces.vechain = {
            accounts: connectedAccounts,
            methods: requiredNamespaces.vechain.methods,
            events: requiredNamespaces.vechain.events,
        }

        nav.goBack()

        try {
            await dispatch(
                approveSession(
                    sessionProposal.id,
                    namespaces,
                    sessionProposal.verifyContext,
                    selectedAccount.address,
                ),
            )
        } catch (err: unknown) {
            error("ConnectedAppScreen:handleAccept", err)
            showErrorToast({
                text1: LL.NOTIFICATION_wallet_connect_error_pairing(),
            })
        }
    }, [sessionProposal, nav, LL, networks, selectedAccount.address, dispatch])

    const rejectProposal = useCallback(
        async (
            currentProposal: SignClientTypes.EventArguments["session_proposal"],
        ) => {
            if (currentProposal) {
                const { id } = currentProposal

                try {
                    const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

                    await web3Wallet.rejectSession({
                        id,
                        reason: getSdkError("USER_REJECTED"),
                    })
                } catch (err: unknown) {
                    error("ConnectedAppScreen:handleReject", err)
                } finally {
                    nav.goBack()
                }
            }
        },
        [nav],
    )

    return {
        processProposal,
        rejectProposal,
    }
}
