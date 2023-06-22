import React, { useState, useEffect, useMemo, useCallback } from "react"
import { AddressUtils, WalletConnectUtils, error } from "~Utils"
import { IWeb3Wallet } from "@walletconnect/web3wallet"
import { SignClientTypes, SessionTypes } from "@walletconnect/types"
import {
    useAppSelector,
    useAppDispatch,
    selectSelectedAccountAddress,
    selectVisibleAccounts,
    deleteSession,
    selectAccount,
    changeSelectedNetwork,
} from "~Storage/Redux"
import { SignMessageModal } from "./Modals/SignMessageModal"
import { showErrorToast, showInfoToast, showSuccessToast } from "~Components"
import { useI18nContext } from "~i18n"
import { getSdkError } from "@walletconnect/utils"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { RequestMethods } from "~Constants"
import { AccountWithDevice, Network } from "~Model"

/**
 * Wallet Connect Flow:
 * 1) A pairing needs to be established by scanning the QR code or by manually pasting the URI
 * 2) After pairing is established the dapp will send a session_propsal asking the user permission to connect to the wallet
 * 3) Once the dapp and the wallet are connected the dapp can send session_requests asking to sign certificates or execute transactions
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
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const [web3Wallet, setWeb3wallet] = useState<IWeb3Wallet>()
    const nav = useNavigation()
    const accounts = useAppSelector(selectVisibleAccounts)

    // For session request
    const [signMessageModalVisible, setSignMessageModalVisible] =
        useState(false)
    const [sessionRequest, setSessionRequest] = useState<SessionTypes.Struct>()
    const [requestEventData, setRequestEventData] =
        useState<SignClientTypes.EventArguments["session_request"]>()

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
            try {
                await web3Wallet?.core.pairing.pair({
                    uri,
                    activatePairing: true,
                })

                showInfoToast(
                    LL.NOTIFICATION_warning_wallet_connect_connection_could_delay(),
                )
            } catch (err: unknown) {
                error(err)

                showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
            }
        },
        [web3Wallet, LL],
    )

    /**
     * Handle session proposal
     */
    const onSessionProposal = useCallback(
        (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
            if (!selectedAccountAddress) return
            if (!web3Wallet) return
            if (!proposal.params.requiredNamespaces.vechain) {
                showErrorToast(
                    LL.NOTIFICATION_wallet_connect_incompatible_dapp(),
                )
                return
            }

            nav.navigate(Routes.CONNECT_APP_SCREEN, {
                sessionProposal: proposal,
            })
        },
        [nav, selectedAccountAddress, web3Wallet, LL],
    )

    /**
     * Handle session request
     */
    const onSessionRequest = useCallback(
        async (
            requestEvent: SignClientTypes.EventArguments["session_request"],
        ) => {
            if (!web3Wallet)
                throw new Error("Web3Wallet is not initialized properly")

            // Get the session for this topic
            const session: SessionTypes.Struct =
                web3Wallet.engine.signClient.session.get(requestEvent.topic)

            // Switch to the requested account
            const address = session.namespaces.vechain.accounts[0].split(":")[2]
            const selectedAccount: AccountWithDevice | undefined =
                accounts.find(acct => {
                    return AddressUtils.compareAddresses(address, acct.address)
                })
            if (!selectedAccount) throw new Error("Account not found")
            dispatch(selectAccount({ address: selectedAccount.address }))

            // Switch to the requested network
            const network: Network = WalletConnectUtils.getNetworkType(
                requestEvent.params.chainId,
            )
            dispatch(changeSelectedNetwork(network))

            // Set the session request and the request event data
            setSessionRequest(session)
            setRequestEventData(requestEvent)

            switch (requestEvent.params.request.method) {
                case RequestMethods.IDENTIFY:
                    setSignMessageModalVisible(true)
                    break
                case RequestMethods.REQUEST_TRANSACTION:
                    nav.navigate(Routes.CONNECTED_APP_SIGN_TRANSACTION_SCREEN, {
                        session,
                        requestEvent,
                    })
                    break
                default:
                    error("Wallet Connect Session Request Invalid Method")
                    break
            }
        },
        [web3Wallet, accounts, dispatch, nav],
    )

    const onSessionRequestClose = useCallback(() => {
        setSessionRequest(undefined)
        setRequestEventData(undefined)
        setSignMessageModalVisible(false)
    }, [])

    /**
     * Handle session delete
     */
    const disconnect = useCallback(
        async (topic: string, fromRemote = false) => {
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

                if (fromRemote) {
                    showInfoToast(
                        LL.NOTIFICATION_wallet_connect_disconnected_from_remote(),
                    )
                } else {
                    showSuccessToast(
                        LL.NOTIFICATION_wallet_connect_disconnected_success(),
                    )
                }
            }
        },
        [web3Wallet, dispatch, LL],
    )

    const onSessionDelete = useCallback(
        (payload: { id: number; topic: string }) => {
            if (!selectedAccountAddress) return

            disconnect(payload.topic, true)
        },
        [selectedAccountAddress, disconnect],
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
            {selectedAccountAddress && (
                <>
                    {requestEventData &&
                        sessionRequest &&
                        signMessageModalVisible && (
                            <SignMessageModal
                                onClose={onSessionRequestClose}
                                isOpen={signMessageModalVisible}
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
