import React, { useCallback, useEffect, useMemo, useState } from "react"
import { AddressUtils, debug, error, WalletConnectUtils, warn } from "~Utils"
import { IWeb3Wallet } from "@walletconnect/web3wallet"
import {
    PendingRequestTypes,
    SessionTypes,
    SignClientTypes,
} from "@walletconnect/types"
import {
    changeSelectedNetwork,
    deleteSession,
    selectSelectedAccountAddress,
    selectSessionsFlat,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { showErrorToast, showInfoToast, showSuccessToast } from "~Components"
import { useI18nContext } from "~i18n"
import { getSdkError } from "@walletconnect/utils"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { RequestMethods } from "~Constants"
import { AccountWithDevice, Network } from "~Model"
import { useSetSelectedAccount } from "~Hooks"
import { Linking } from "react-native"

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
    const activeSessionsFlat = useAppSelector(selectSessionsFlat)
    const { onSetSelectedAccount } = useSetSelectedAccount()

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

            if (activeSessionsFlat.some(s => s.topic === topic)) {
                return
            }

            try {
                await web3Wallet?.core.pairing.pair({
                    uri,
                    activatePairing: true,
                })

                showInfoToast(
                    LL.NOTIFICATION_warning_wallet_connect_connection_could_delay(),
                )
            } catch (err: unknown) {
                error("WalletConnectProvider:onPair", err)

                showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
            }
        },
        [activeSessionsFlat, web3Wallet, LL],
    )

    const handleLinkingUrl = useCallback(
        async (url: string) => {
            if (typeof url !== "string") return

            try {
                let pairingUri

                // Android
                if (WalletConnectUtils.isValidURI(url)) {
                    pairingUri = url
                } else {
                    // iOS
                    const iosUrl = new URL(url)
                    const wcUri = iosUrl.searchParams.get("uri")

                    if (wcUri && WalletConnectUtils.isValidURI(wcUri)) {
                        pairingUri = wcUri
                    }
                }

                if (pairingUri) {
                    await onPair(pairingUri)
                }
            } catch (e) {
                error("WalletConnectProvider:handleLinkingUrl", e)
            }
        },
        [onPair],
    )

    /**
     * Handle session proposal
     */
    const onSessionProposal = useCallback(
        (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
            if (proposal.verifyContext.verified.validation !== "VALID")
                warn("Session proposal is not valid", proposal.verifyContext)

            if (
                proposal.verifyContext.verified.validation === "VALID" ||
                process.env.NODE_ENV !== "production"
            ) {
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
            } else {
                showErrorToast(
                    LL.NOTIFICATION_WALLET_CONNECT_DAPP_NOT_VERIFIED(),
                )
            }
        },
        [nav, selectedAccountAddress, web3Wallet, LL],
    )

    const goToSignMessage = useCallback(
        (
            requestEvent: PendingRequestTypes.Struct,
            session: SessionTypes.Struct,
            signingAccount: string,
        ) => {
            const message = WalletConnectUtils.getSignCertMessage(requestEvent)
            const options = WalletConnectUtils.getSignCertOptions(requestEvent)

            if (
                AddressUtils.isValid(options.signer) &&
                !AddressUtils.compareAddresses(options.signer, signingAccount)
            ) {
                showErrorToast(LL.NOTIFICATION_DAPP_REQUEST_INVALID_ACCOUNT())
            }

            options.signer = signingAccount

            if (message) {
                nav.navigate(Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN, {
                    requestEvent,
                    session,
                    message,
                    options,
                })
            } else {
                showErrorToast(LL.NOTIFICATION_DAPP_INVALID_REQUEST())
            }
        },
        [nav, LL],
    )

    const goToSendTransaction = useCallback(
        (
            requestEvent: PendingRequestTypes.Struct,
            session: SessionTypes.Struct,
            signingAccount: string,
        ) => {
            const message = WalletConnectUtils.getSendTxMessage(requestEvent)
            const options = WalletConnectUtils.getSendTxOptions(requestEvent)

            if (
                AddressUtils.isValid(options.signer) &&
                !AddressUtils.compareAddresses(options.signer, signingAccount)
            ) {
                showErrorToast(LL.NOTIFICATION_DAPP_REQUEST_INVALID_ACCOUNT())
            }

            options.signer = signingAccount

            if (message) {
                nav.navigate(Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN, {
                    requestEvent,
                    session,
                    message,
                    options,
                })
            } else {
                showErrorToast(LL.NOTIFICATION_DAPP_INVALID_REQUEST())
            }
        },
        [nav, LL],
    )

    /**
     * Handle session request
     */
    const onSessionRequest = useCallback(
        async (requestEvent: PendingRequestTypes.Struct) => {
            debug(
                "Session request: ",
                JSON.stringify({
                    id: requestEvent.id,
                    topic: requestEvent.topic,
                    method: requestEvent.params.request.method,
                }),
            )

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
            if (!selectedAccount) {
                await web3Wallet.disconnectSession({
                    topic: session.topic,
                    reason: {
                        code: 4100,
                        message: "Requested account not found",
                    },
                })
                return
            }

            onSetSelectedAccount({ address: selectedAccount.address })

            // Switch to the requested network
            const network: Network = WalletConnectUtils.getNetworkType(
                requestEvent.params.chainId,
            )
            dispatch(changeSelectedNetwork(network))

            // Show the screen based on the request method
            switch (requestEvent.params.request.method) {
                case RequestMethods.IDENTIFY:
                    goToSignMessage(requestEvent, session, address)
                    break
                case RequestMethods.REQUEST_TRANSACTION:
                    goToSendTransaction(requestEvent, session, address)
                    break
                default:
                    error("Wallet Connect Session Request Invalid Method")
                    break
            }
        },
        [
            accounts,
            onSetSelectedAccount,
            web3Wallet,
            dispatch,
            goToSendTransaction,
            goToSignMessage,
        ],
    )

    /**
     * Handle session delete
     */
    const disconnect = useCallback(
        async (topic: string, fromRemote = false) => {
            debug("Disconnecting session", topic, fromRemote)

            if (!web3Wallet) return

            try {
                await web3Wallet.disconnectSession({
                    topic,
                    reason: getSdkError("USER_DISCONNECTED"),
                })
            } catch (err: unknown) {
                error("WalletConnectProvider:disconnect", err)
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
            debug("Session delete", payload)

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
    }, [activeSessionsFlat])

    /**
     * Check that we are processing session requests every 3 seconds
     */
    useEffect(() => {
        const checkRequests = async () => {
            const pendingRequests = web3Wallet?.getPendingSessionRequests()

            if (pendingRequests && pendingRequests.length > 0) {
                const nextRequest = pendingRequests[0]
                if (WalletConnectUtils.isWalletConnectRoute(nav.getState()))
                    return
                await onSessionRequest(nextRequest)
            }
        }

        const interval = setInterval(async () => {
            await checkRequests()
        }, 3000)

        checkRequests()

        return () => clearInterval(interval)
    }, [web3Wallet, onSessionRequest, nav])

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

    useEffect(() => {
        Linking.getInitialURL().then(url => {
            debug("WalletConnectProvider:Linking.getInitialURL", url)
            if (url) {
                handleLinkingUrl(url)
            }
        })
    })

    /**
     * Sets up a listener for DApp session proposals
     */
    useEffect(() => {
        Linking.addListener("url", event => {
            debug("WalletConnectProvider:Linking.addListener", event)
            handleLinkingUrl(event.url)
        })
    }, [handleLinkingUrl, onPair])

    /**
     * Remove expired sessions
     */
    useEffect(() => {
        activeSessionsFlat.forEach(session => {
            if (session.expiry < Date.now()) {
                dispatch(deleteSession({ topic: session.topic }))
            }
        })
    }, [dispatch, activeSessionsFlat])

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
