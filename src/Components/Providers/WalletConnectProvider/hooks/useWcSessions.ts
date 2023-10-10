import { Dispatch, SetStateAction, useCallback, useEffect } from "react"
import { debug, error, WalletConnectUtils, warn } from "~Utils"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import {
    ActiveSessions,
    showErrorToast,
    showInfoToast,
    showSuccessToast,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { getRpcError } from "~Components/Providers/WalletConnectProvider/errors/rpcErrors"
import { ErrorResponse } from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"

type ApproveSession = (args: {
    id: number
    namespaces: Record<string, SessionTypes.Namespace>
    relayProtocol: string
}) => Promise<SessionTypes.Struct>

export const useWcSessions = (
    setActiveSessions: Dispatch<SetStateAction<ActiveSessions>>,
) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)

    /**
     * Initialise the current sessions
     */
    useEffect(() => {
        WalletConnectUtils.getWeb3Wallet().then(wallet => {
            setActiveSessions(wallet.getActiveSessions())
        })
    }, [setActiveSessions])

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
            debug("WalletConnectProvider:onPair", uri)

            const topic = WalletConnectUtils.getTopicFromPairUri(uri)

            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            const existingSession = web3Wallet.getActiveSessions()[topic]

            if (existingSession) {
                return
            }

            try {
                await web3Wallet.core.pairing.pair({
                    uri,
                    activatePairing: true,
                })

                showInfoToast({
                    text1: LL.NOTIFICATION_warning_wallet_connect_connection_could_delay(),
                })
            } catch (err: unknown) {
                if (
                    err instanceof Error &&
                    err.message.includes("Pairing already exists")
                ) {
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

    const disconnectSession = useCallback(
        async (topic: string, fromRemote = false) => {
            debug("Disconnecting session", topic, fromRemote)

            try {
                setActiveSessions(prevState => {
                    const newState = { ...prevState }
                    delete newState[topic]
                    return newState
                })

                const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

                if (!fromRemote) {
                    await web3Wallet.disconnectSession({
                        topic,
                        reason: getSdkError("USER_DISCONNECTED"),
                    })
                }

                if (fromRemote) {
                    showInfoToast({
                        text1: LL.NOTIFICATION_wallet_connect_disconnected_from_remote(),
                    })
                } else {
                    showSuccessToast({
                        text1: LL.NOTIFICATION_wallet_connect_disconnected_success(),
                    })
                }
            } catch (e) {
                error("WalletConnectProvider:disconnectSession - err", e)
            }
        },
        [setActiveSessions, LL],
    )

    const approveSession: ApproveSession = useCallback(
        async ({
            id,
            namespaces,
            relayProtocol,
        }): Promise<SessionTypes.Struct> => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            const session = await web3Wallet.approveSession({
                id,
                namespaces,
                relayProtocol,
            })

            setActiveSessions(prevState => {
                return {
                    ...prevState,
                    [session.topic]: session,
                }
            })

            return session
        },
        [setActiveSessions],
    )

    const respondInvalidSession = useCallback(
        async (
            proposal: SignClientTypes.EventArguments["session_proposal"],
            err: ErrorResponse,
        ) => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            await web3Wallet.rejectSession({
                id: proposal.id,
                reason: {
                    code: err.code,
                    message: err.message,
                },
            })
        },
        [],
    )

    /**
     * Handle session proposal
     */
    const onSessionProposal = useCallback(
        (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
            if (proposal.verifyContext.verified.validation !== "VALID")
                //So we can see invalid proposals in dev mode
                warn(
                    "onSessionProposal - session not valid",
                    proposal.verifyContext,
                )

            if (!selectedAccountAddress)
                return respondInvalidSession(proposal, getRpcError("internal"))
            if (!proposal.params.requiredNamespaces.vechain) {
                showErrorToast({
                    text1: LL.NOTIFICATION_wallet_connect_incompatible_dapp(),
                })
                return respondInvalidSession(
                    proposal,
                    getRpcError("invalidRequest"),
                )
            }

            nav.navigate(Routes.CONNECT_APP_SCREEN, {
                sessionProposal: proposal,
            })
        },
        [respondInvalidSession, nav, selectedAccountAddress, LL],
    )

    const onSessionDelete = useCallback(
        (payload: { id: number; topic: string }) => {
            debug("Session delete", payload)

            if (!selectedAccountAddress) return

            disconnectSession(payload.topic, true)
        },
        [selectedAccountAddress, disconnectSession],
    )

    return {
        disconnectSession,
        approveSession,
        onPair,
        onSessionProposal,
        onSessionDelete,
    }
}
