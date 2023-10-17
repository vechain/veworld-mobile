import { useCallback, useEffect, useMemo, useState } from "react"
import { debug, WalletConnectUtils, warn } from "~Utils"
import { getRpcError, SessionProposal, SessionProposalState } from "~Components"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { SessionTypes } from "@walletconnect/types"

export const useSessionProposals = (
    isBlackListScreen: () => boolean,
    addSession: (session: SessionTypes.Struct) => void,
) => {
    const nav = useNavigation()

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

    const handlePendingProposal = useCallback(
        async (proposal: SessionProposal) => {
            if (proposal.verifyContext.verified.validation !== "VALID")
                //So we can see invalid proposals in dev mode
                warn(
                    "onSessionProposal - session not valid",
                    proposal.verifyContext,
                )

            nav.navigate(Routes.CONNECT_APP_SCREEN, {
                sessionProposal: proposal,
            })
        },
        [nav],
    )

    const approvePendingProposal = useCallback(
        async (
            proposal: SessionProposal,
            namespaces: SessionTypes.Namespaces,
        ) => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            const relays = proposal.params.relays[0]

            const session = await web3Wallet.approveSession({
                id: proposal.id,
                namespaces,
                relayProtocol: relays.protocol,
            })

            addSession(session)

            removePendingProposal(proposal)
        },
        [removePendingProposal, addSession],
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
