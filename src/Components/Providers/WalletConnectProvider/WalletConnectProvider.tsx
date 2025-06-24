import { NavigationState, useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo } from "react"
import { useSessionProposals } from "~Components/Providers/WalletConnectProvider/hooks/useSessionProposals"
import { useWcDeepLinking } from "~Components/Providers/WalletConnectProvider/hooks/useWcDeepLinking"
import { useWcPairing } from "~Components/Providers/WalletConnectProvider/hooks/useWcPairing"
import { useWcSessions } from "~Components/Providers/WalletConnectProvider/hooks/useWcSessions"
import { ERROR_EVENTS } from "~Constants"
import { WalletConnectUtils, warn } from "~Utils"
import { useInteraction } from "../InteractionProvider"
import { useWcRequest } from "./hooks"

/**
 * Wallet Connect Flow:
 * 1) A pairing needs to be established by scanning the QR code or by manually pasting the URI
 * 2) After pairing is established the dapp will send a session_proposal asking the user permission to connect to the wallet
 * 3) Once the dapp and the wallet are connected the dapp can send session_requests asking to sign certificates or execute transactions
 *
 * This provider was created to have a singleton web3wallet instance, so that all modals regarding session proposals and requests
 * are handled by the provider can be shown no matter where we are inside the app.
 */

type WCContext = {
    rejectPendingProposal: ReturnType<typeof useSessionProposals>["rejectPendingProposal"]
    approvePendingProposal: ReturnType<typeof useSessionProposals>["approvePendingProposal"]
    disconnectSession: ReturnType<typeof useWcSessions>["disconnectSession"]
    onPair: ReturnType<typeof useWcPairing>["onPair"]
    failRequest: ReturnType<typeof useWcRequest>["failRequest"]
    processRequest: ReturnType<typeof useWcRequest>["processRequest"]
    activeSessions: ReturnType<typeof useWcSessions>["activeSessions"]
}

type WalletConnectContextProviderProps = { children: React.ReactNode }
const WalletConnectContext = React.createContext<WCContext>({} as WCContext)

const WalletConnectContextProvider = ({ children }: WalletConnectContextProviderProps) => {
    // General
    const nav = useNavigation()
    const { certificateBsData, connectBsData } = useInteraction()

    const isBlackListScreen = useCallback((): boolean => {
        if (!nav) return true
        if (certificateBsData?.type === "wallet-connect" || connectBsData?.type === "wallet-connect") return true
        return !WalletConnectUtils.shouldAutoNavigate(nav.getState() as NavigationState<ReactNavigation.RootParamList>)
    }, [certificateBsData?.type, connectBsData?.type, nav])

    const { addSessionDisconnect, disconnectSession, activeSessions, addSession } = useWcSessions()

    const { onPair } = useWcPairing(activeSessions)

    const { pairingTopics: deepLinkPairingTopics } = useWcDeepLinking(onPair)

    const { addPendingProposal, rejectPendingProposal, approvePendingProposal } = useSessionProposals(
        isBlackListScreen,
        addSession,
        deepLinkPairingTopics,
    )

    const { addPendingRequest, failRequest, processRequest } = useWcRequest(isBlackListScreen, activeSessions)

    /**
     * Execute at start
     */
    useEffect(() => {
        ;(async () => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            for (const event of ["session_proposal", "session_request", "session_delete"]) {
                if (web3Wallet.events.listenerCount(event) > 0) {
                    warn(ERROR_EVENTS.WALLET_CONNECT, `Wallet Connect Provider: ${event} listener already exists`)
                }
            }

            web3Wallet.on("session_proposal", addPendingProposal)
            web3Wallet.on("session_request", addPendingRequest)
            web3Wallet.on("session_delete", addSessionDisconnect)
        })()
    }, [addPendingRequest, addPendingProposal, addSessionDisconnect])

    // Needed for the context
    const value = useMemo(
        () => ({
            rejectPendingProposal,
            approvePendingProposal,
            disconnectSession,
            onPair,
            failRequest,
            processRequest,
            activeSessions,
        }),
        [
            rejectPendingProposal,
            approvePendingProposal,
            disconnectSession,
            onPair,
            failRequest,
            processRequest,
            activeSessions,
        ],
    )

    if (!value) {
        return <></>
    }

    return <WalletConnectContext.Provider value={value}>{children}</WalletConnectContext.Provider>
}

const useWalletConnect = () => {
    const context = React.useContext(WalletConnectContext)
    if (!context) {
        throw new Error("useWalletConnect must be used within a WalletConnectContextProvider")
    }

    return context
}

export { useWalletConnect, WalletConnectContextProvider }
