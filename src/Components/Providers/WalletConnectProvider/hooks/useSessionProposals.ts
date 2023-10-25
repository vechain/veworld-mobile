import { useCallback, useEffect, useMemo, useState } from "react"
import { debug, WalletConnectUtils, warn } from "~Utils"
import {
    getRpcError,
    SessionProposal,
    SessionProposalState,
    showErrorToast,
} from "~Components"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { ErrorResponse } from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"
import { useI18nContext } from "~i18n"
import { SessionTypes } from "@walletconnect/types"
import { insertContext, useAppDispatch } from "~Storage/Redux"
import { validateRequestNamespaces } from "~Components/Providers/WalletConnectProvider/config/supported-chains"

export const useSessionProposals = (
    isBlackListScreen: () => boolean,
    addSession: (session: SessionTypes.Struct) => void,
    deepLinkPairingTopics: string[],
) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const [sessionProposals, setSessionProposals] =
        useState<SessionProposalState>({})
    const proposalList = useMemo(
        () => Object.values(sessionProposals),
        [sessionProposals],
    )

    /**
     * DO NOT add any dependencies to this callback, otherwise the listener will be added multiple times
     */
    const addPendingProposal = useCallback((proposal: SessionProposal) => {
        setSessionProposals(prev => ({
            ...prev,
            [proposal.id]: proposal,
        }))
    }, [])

    const removePendingProposal = useCallback((proposal: SessionProposal) => {
        setSessionProposals(prev => {
            const _prev = { ...prev }
            delete _prev[proposal.id]
            return _prev
        })
    }, [])

    const respondInvalidSession = useCallback(
        async (proposal: SessionProposal, err: ErrorResponse) => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            await web3Wallet.rejectSession({
                id: proposal.id,
                reason: err,
            })

            removePendingProposal(proposal)
        },
        [removePendingProposal],
    )

    const handlePendingProposal = useCallback(
        async (proposal: SessionProposal) => {
            if (proposal.verifyContext.verified.validation !== "VALID")
                //So we can see invalid proposals in dev mode
                warn(
                    "onSessionProposal - session not valid",
                    proposal.verifyContext,
                )

            const validationError =
                validateRequestNamespaces(proposal.params.requiredNamespaces) ??
                validateRequestNamespaces(proposal.params.optionalNamespaces)

            if (validationError) {
                warn("onSessionProposal - session not valid", validationError)
                showErrorToast({
                    text1: LL.NOTIFICATION_wallet_connect_incompatible_dapp(),
                })
                return await respondInvalidSession(proposal, validationError)
            }

            nav.navigate(Routes.CONNECT_APP_SCREEN, {
                sessionProposal: proposal,
            })
        },
        [LL, nav, respondInvalidSession],
    )

    const approvePendingProposal = useCallback(
        async (
            proposal: SessionProposal,
            namespaces: SessionTypes.Namespaces,
        ): Promise<SessionTypes.Struct> => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            const relays = proposal.params.relays[0]

            const session = await web3Wallet.approveSession({
                id: proposal.id,
                namespaces,
                relayProtocol: relays.protocol,
            })

            addSession(session)

            const isDeepLinkSession = deepLinkPairingTopics.includes(
                session.pairingTopic,
            )

            dispatch(
                insertContext({
                    topic: session.topic,
                    verifyContext: proposal.verifyContext.verified,
                    isDeepLink: isDeepLinkSession,
                }),
            )

            removePendingProposal(proposal)

            return session
        },
        [deepLinkPairingTopics, dispatch, removePendingProposal, addSession],
    )

    const rejectPendingProposal = useCallback(
        async (proposal: SessionProposal) => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            await web3Wallet.rejectSession({
                id: proposal.id,
                reason: getRpcError("userRejectedRequest"),
            })

            removePendingProposal(proposal)
        },
        [removePendingProposal],
    )

    /**
     * Set's a timer to run if there is a pending proposal. Will not trigger until the user is NOT processing another WC request.
     */
    useEffect(() => {
        if (proposalList.length === 0) return

        const proposal: SessionProposal = proposalList[0]

        let timer: NodeJS.Timeout

        //Process instantly
        if (!isBlackListScreen()) {
            handlePendingProposal(proposal)
            //Or else loop until we can process
        } else {
            timer = setInterval(() => {
                if (isBlackListScreen()) return

                handlePendingProposal(proposal)
            }, 250)
        }

        return () => clearTimeout(timer)
    }, [
        proposalList,
        isBlackListScreen,
        sessionProposals,
        handlePendingProposal,
    ])

    useEffect(() => {
        debug(
            "sessionProposals",
            Object.values(sessionProposals).map(s => s.id),
        )
    }, [sessionProposals])

    return {
        addPendingProposal,
        approvePendingProposal,
        rejectPendingProposal,
    }
}
