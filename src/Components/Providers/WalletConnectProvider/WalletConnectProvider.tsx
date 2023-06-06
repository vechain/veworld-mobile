import React, { useState, useEffect, useMemo, useCallback } from "react"
import { WalletConnectUtils } from "~Utils"
import { IWeb3Wallet } from "@walletconnect/web3wallet"
import { SignClientTypes, SessionTypes } from "@walletconnect/types"
import {
    useAppSelector,
    useAppDispatch,
    selectAccountsState,
} from "~Storage/Redux"
import { PairModal } from "./Modals/PairModal"
import { SignModal } from "./Modals/SignModal"
import { showSuccessToast } from "~Components"
import { useI18nContext } from "~i18n"
import { deleteSession } from "~Storage/Redux/Slices"

type WalletConnectContextProviderProps = { children: React.ReactNode }
const WalletConnectContext = React.createContext<IWeb3Wallet | undefined>(
    undefined,
)
const WalletConnectContextProvider = ({
    children,
}: WalletConnectContextProviderProps) => {
    // General
    const selectedAccount = useAppSelector(selectAccountsState).selectedAccount
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const [web3Wallet, setWeb3wallet] = useState<IWeb3Wallet>()

    //For session proposal
    const [pairModalVisible, setPairModalVisible] = useState(false)
    const [currentProposal, setCurrentProposal] =
        useState<SignClientTypes.EventArguments["session_proposal"]>()

    // For session request
    const [signModalVisible, setSignModalVisible] = useState(false)
    const [sessionRequest, setSessionRequest] = useState<SessionTypes.Struct>()
    const [requestEventData, setRequestEventData] =
        useState<SignClientTypes.EventArguments["session_request"]>()

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
            setPairModalVisible(true)
            setCurrentProposal(proposal)
        },
        [],
    )

    const onSessionProposalClose = useCallback(() => {
        setCurrentProposal(undefined)
        setPairModalVisible(false)
    }, [])

    /**
     * Handle session request
     */
    const onSessionRequest = useCallback(
        async (
            requestEvent: SignClientTypes.EventArguments["session_request"],
        ) => {
            if (!web3Wallet)
                throw new Error("Web3Wallet is not initialized properly")

            const { topic } = requestEvent

            const sessionRequestData: SessionTypes.Struct =
                web3Wallet.engine.signClient.session.get(topic)

            setSessionRequest(sessionRequestData)
            setRequestEventData(requestEvent)
            setSignModalVisible(true)
        },
        [web3Wallet],
    )

    const onSessionRequestClose = useCallback(() => {
        setSessionRequest(undefined)
        setRequestEventData(undefined)
        setSignModalVisible(false)
    }, [])

    /**
     * Handle session delete
     */
    const onSessionDelete = useCallback(
        (payload: { id: number; topic: string }) => {
            dispatch(deleteSession({ topic: payload.topic }))

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
        if (web3Wallet) {
            web3Wallet.on("session_proposal", onSessionProposal)
            web3Wallet.on("session_request", onSessionRequest)
            web3Wallet.on("session_delete", onSessionDelete)
        }

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
                    {currentProposal && (
                        <PairModal
                            onClose={onSessionProposalClose}
                            currentProposal={currentProposal}
                            isOpen={pairModalVisible}
                        />
                    )}

                    {requestEventData && (
                        <SignModal
                            onClose={onSessionRequestClose}
                            isOpen={signModalVisible}
                            requestEvent={requestEventData}
                            sessionRequest={sessionRequest}
                        />
                    )}
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
