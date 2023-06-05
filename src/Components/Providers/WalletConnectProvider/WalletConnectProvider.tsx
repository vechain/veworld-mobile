import React, { useState, useEffect, useMemo, useCallback } from "react"
import { WalletConnectUtils } from "~Utils"
import { IWeb3Wallet } from "@walletconnect/web3wallet"
import { SignClientTypes } from "@walletconnect/types"
import {
    useAppSelector,
    useAppDispatch,
    selectAccountsState,
} from "~Storage/Redux"
import { PairBottomSheet } from "./Modals/PairBottomSheet"
import { SignBottomSheet } from "./Modals/SignBottomSheet"
import { removeSession } from "~Storage/Redux/Actions/WalletConnect"
import { showSuccessToast } from "~Components"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal } from "~Common"

type WalletConnectContextProviderProps = { children: React.ReactNode }
const WalletConnectContext = React.createContext<IWeb3Wallet | undefined>(
    undefined,
)
const WalletConnectContextProvider = ({
    children,
}: WalletConnectContextProviderProps) => {
    //For session proposal
    const [web3Wallet, setWeb3wallet] = useState<IWeb3Wallet>()
    const [currentProposal, setCurrentProposal] =
        useState<SignClientTypes.EventArguments["session_proposal"]>()

    /* Bottom Sheets */
    const {
        ref: pairBottomSheet,
        onOpen: openPairBottomSheet,
        onClose: closePairBottomSheet,
    } = useBottomSheetModal()

    const {
        ref: signBottomSheet,
        onOpen: openSignBottomSheet,
        onClose: closeSignBottomSheet,
    } = useBottomSheetModal()

    // For session request
    const [requestSession, setRequestSession] = useState()
    const [requestEventData, setRequestEventData] =
        useState<SignClientTypes.EventArguments["session_request"]>()

    // General
    const selectedAccount = useAppSelector(selectAccountsState).selectedAccount

    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    // Needed for the context
    const value = useMemo(
        () => (web3Wallet ? web3Wallet : undefined),
        [web3Wallet],
    )

    /**
     * Handle session proposal
     */
    const onSessionProposal = useCallback(
        (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
            openPairBottomSheet()
            setCurrentProposal(proposal)
        },
        [openPairBottomSheet],
    )

    const onSessionProposalClose = useCallback(() => {
        setCurrentProposal(undefined)
        closePairBottomSheet()
    }, [closePairBottomSheet])

    /**
     * Handle session request
     */
    const onSessionRequest = useCallback(
        async (
            requestEvent: SignClientTypes.EventArguments["session_request"],
        ) => {
            const { topic } = requestEvent

            const requestSessionData =
                web3Wallet?.engine.signClient.session.get(topic)

            setRequestSession(requestSessionData)
            setRequestEventData(requestEvent)
            openSignBottomSheet()
        },
        [web3Wallet, openSignBottomSheet],
    )

    /**
     * Handle session delete
     */
    const onSessionDelete = useCallback(
        (payload: { id: number; topic: string }) => {
            dispatch(removeSession(payload.topic))

            showSuccessToast(
                LL.NOTIFICATION_wallet_connect_disconnected_from_remote(),
            )
        },
        [dispatch, LL],
    )

    /**
     * Execute at start
     */
    useEffect(() => {
        ;(async () => {
            const web3WalletInstance = await WalletConnectUtils.getWeb3Wallet()
            setWeb3wallet(web3WalletInstance)
        })()
    }, [])

    useEffect(() => {
        web3Wallet?.on("session_proposal", onSessionProposal)
        web3Wallet?.on("session_request", onSessionRequest)
        web3Wallet?.on("session_delete", onSessionDelete)

        // Cancel subscription to events when component unmounts
        return () => {
            web3Wallet?.off("session_proposal", onSessionProposal)
            web3Wallet?.off("session_request", onSessionRequest)
            web3Wallet?.off("session_delete", onSessionDelete)
        }
    }, [web3Wallet, onSessionRequest, onSessionProposal, onSessionDelete])

    if (!value) {
        return <></>
    }

    return (
        <WalletConnectContext.Provider value={value}>
            {children}
            {selectedAccount && (
                <>
                    <PairBottomSheet
                        onClose={onSessionProposalClose}
                        currentProposal={currentProposal}
                        ref={pairBottomSheet}
                    />

                    <SignBottomSheet
                        onClose={closeSignBottomSheet}
                        ref={signBottomSheet}
                        requestEvent={requestEventData}
                        requestSession={requestSession}
                    />
                </>
            )}
        </WalletConnectContext.Provider>
    )
}

const useWalletConnect = () => {
    const context = React.useContext(WalletConnectContext)
    if (!context) {
        throw new Error(
            "useWalletConnect must be used within a WalletConnectContextProvider",
        )
    }

    return context
}

export { WalletConnectContextProvider, useWalletConnect }
