import {
    removePendingSession,
    selectNetworks,
    selectSelectedAccount,
    upsertSession,
    useAppDispatch,
    useAppSelector,
    WalletConnectPendingSession,
    WalletConnectSession,
} from "~Storage/Redux"
import { useCallback } from "react"
import { SessionTypes } from "@walletconnect/types"
import { WalletConnectService } from "~Services"
import { getSdkError } from "@walletconnect/utils"
import { error } from "~Utils"
import { useNavigation } from "@react-navigation/native"

export const useWcSessions = (pendingSession: WalletConnectPendingSession) => {
    const dispatch = useAppDispatch()
    const networks = useAppSelector(selectNetworks)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const nav = useNavigation()

    const approveSession = useCallback(async () => {
        const proposedNamespace = pendingSession.namespace
        const connectedAccounts: string[] = []
        const networkIdentifiers = networks.map(network =>
            network.genesis.id.slice(-32),
        )

        const _networks =
            pendingSession.namespace.chains ??
            networks.map(network => `vechain:${network.genesis.id.slice(-32)}`)

        _networks.map((scope: string) => {
            // Valid only for supported networks
            // scope example: vechain:b1ac3413d346d43539627e6be7ec1b4a, vechain:87721b09ed2e15997f466536b20bb127
            const network = scope.split(":")[1]

            if (networkIdentifiers.includes(network)) {
                connectedAccounts.push(`${scope}:${selectedAccount.address}`)
            }
        })

        const namespace: SessionTypes.Namespace = {
            accounts: connectedAccounts,
            methods: proposedNamespace.methods,
            events: proposedNamespace.events,
        }

        const namespaces: Record<string, SessionTypes.Namespace> = {
            vechain: namespace,
        }

        nav.goBack()

        const session = await WalletConnectService.approveSession(
            pendingSession.id,
            namespaces,
        )

        const wcSession: WalletConnectSession = {
            topic: session.topic,
            chains: namespaces.vechain.chains ?? [],
            verifyContext: pendingSession.verifyContext,
            dAppMetadata: pendingSession.dAppMetadata,
            namespace,
            account: selectedAccount.address,
        }

        dispatch(removePendingSession())
        dispatch(upsertSession({ wcSession }))
    }, [dispatch, networks, pendingSession, selectedAccount.address, nav])

    const rejectSession = useCallback(async () => {
        const { id } = pendingSession

        try {
            await WalletConnectService.rejectSession(
                id,
                getSdkError("USER_REJECTED"),
            )

            dispatch(removePendingSession())
        } catch (err: unknown) {
            error("ConnectedAppScreen:handleReject", err)
        } finally {
            dispatch(removePendingSession())
        }
    }, [dispatch, pendingSession])

    return { approveSession, rejectSession }
}
