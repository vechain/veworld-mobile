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
import { SignIdentityModal } from "./Modals/SignIdentityModal"
import { SignTransactionModal } from "./Modals/SignTransactionModal"
import { showErrorToast, showInfoToast, showSuccessToast } from "~Components"
import { useI18nContext } from "~i18n"
import { deleteSession } from "~Storage/Redux/Slices"
import { getSdkError } from "@walletconnect/utils"
import { error } from "~Common"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"

/**
 * Wallet Connect Flow:
 * 1) A pairing needs to be established by scanning the QR code or by manually pasting the URI
 * 2) After pairing is established the dapp will send a session_propsal asking the user permission to connect to the wallet
 * 3) Once the dapp and the wallet are connected the dapp can send a session_requests asking to sign certificates or execute transactions
 *
 * This provider was created to have a singleton web3wallet instance, so that all modals regarding session proposals and requests
 * are handled by the provider can be shown no matter where we are inside the app.
 */

type WalletConnectContextProviderProps = { children: React.ReactNode }
const WalletConnectContext = React.createContext<{
    web3Wallet: IWeb3Wallet | undefined
    disconnect: (topic: string) => Promise<void>
    onPair: (uri: string) => Promise<void>
}>({
    web3Wallet: undefined,
    disconnect: async () => {},
    onPair: async () => {},
})

const WalletConnectContextProvider = ({
    children,
}: WalletConnectContextProviderProps) => {
    // General
    const selectedAccount = useAppSelector(selectAccountsState).selectedAccount
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const [web3Wallet, setWeb3wallet] = useState<IWeb3Wallet>()
    const nav = useNavigation()

    //For session proposal
    const [pairModalVisible, setPairModalVisible] = useState(false)
    const [currentProposal, setCurrentProposal] =
        useState<SignClientTypes.EventArguments["session_proposal"]>()

    // For session request
    const [signIdentityModalVisible, setSignIdentityModalVisible] =
        useState(false)
    const [signTransactionModalVisible, setSignTransactionModalVisible] =
        useState(false)
    const [sessionRequest, setSessionRequest] = useState<SessionTypes.Struct>()
    const [requestEventData, setRequestEventData] =
        useState<SignClientTypes.EventArguments["session_request"]>()

    /**
     * The pair method initiates a WalletConnect pairing process with a dapp
     * using the given uri (QR code from the dapps).
     * After the pairing is established, the dapp will send a session_proposal
     * asking the user permission to connect to the wallet.
     */
    const onPair = useCallback(
        async (uri: string) => {
            try {
                await web3Wallet?.core.pairing.pair({
                    uri,
                    activatePairing: true,
                })

                showInfoToast("Connecting may take a few seconds.")
            } catch (err: unknown) {
                error(err)

                showErrorToast(
                    "Error pairing with Dapp, please generate a new QR CODE",
                )
            }
        },
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
        nav.navigate(Routes.SETTINGS_CONNECTED_APPS)
    }, [nav])

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

            //TODO: check if the request is a sign identity or sign transaction
            switch (requestEvent?.params?.request?.method) {
                case WalletConnectUtils.VECHAIN_SIGNING_METHODS.IDENTIFY:
                    setSignIdentityModalVisible(true)
                    break
                case WalletConnectUtils.VECHAIN_SIGNING_METHODS
                    .REQUEST_TRANSACTION:
                    setSignTransactionModalVisible(true)
                    break
                default:
                    return ""
            }
        },
        [web3Wallet],
    )

    const onSessionRequestClose = useCallback(() => {
        setSessionRequest(undefined)
        setRequestEventData(undefined)
        setSignIdentityModalVisible(false)
        setSignTransactionModalVisible(false)
    }, [])

    /**
     * Handle session delete
     */
    const disconnect = useCallback(
        async (topic: string) => {
            if (!web3Wallet) return

            try {
                await web3Wallet.disconnectSession({
                    topic,
                    reason: getSdkError("USER_DISCONNECTED"),
                })
            } catch (err: unknown) {
                error(err)
            } finally {
                dispatch(deleteSession({ topic }))

                showSuccessToast(
                    LL.NOTIFICATION_wallet_connect_disconnected_from_remote(),
                )
            }
        },
        [web3Wallet, dispatch, LL],
    )

    const onSessionDelete = useCallback(
        (payload: { id: number; topic: string }) => {
            if (!selectedAccount) return

            disconnect(payload.topic)
        },
        [selectedAccount, disconnect],
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

    // Needed for the context
    const value = useMemo(
        () => ({
            web3Wallet: web3Wallet ?? undefined,
            disconnect,
            onPair,
        }),
        [web3Wallet, disconnect, onPair],
    )

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

                    {requestEventData &&
                        sessionRequest &&
                        signIdentityModalVisible && (
                            <SignIdentityModal
                                onClose={onSessionRequestClose}
                                isOpen={signIdentityModalVisible}
                                requestEvent={requestEventData}
                                sessionRequest={sessionRequest}
                            />
                        )}

                    {requestEventData &&
                        sessionRequest &&
                        signTransactionModalVisible && (
                            <SignTransactionModal
                                onClose={onSessionRequestClose}
                                isOpen={signTransactionModalVisible}
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
