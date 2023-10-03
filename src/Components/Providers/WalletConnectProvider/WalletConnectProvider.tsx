import React, { useCallback, useEffect, useMemo, useState } from "react"
import { debug, error, WalletConnectUtils, warn } from "~Utils"
import { SignClientTypes } from "@walletconnect/types"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    useApplicationSecurity,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { WALLET_STATUS } from "~Model"
import { Linking } from "react-native"
import { useWcRequest } from "./hooks"
import { rpcErrors } from "@metamask/rpc-errors"
import { JsonRpcError } from "@metamask/rpc-errors/dist/classes"

/**
 * Wallet Connect Flow:
 * 1) A pairing needs to be established by scanning the QR code or by manually pasting the URI
 * 2) After pairing is established the dapp will send a session_proposal asking the user permission to connect to the wallet
 * 3) Once the dapp and the wallet are connected the dapp can send session_requests asking to sign certificates or execute transactions
 *
 * This provider was created to have a singleton web3wallet instance, so that all modals regarding session proposals and requests
 * are handled by the provider can be shown no matter where we are inside the app.
 */

type IWalletConnect = {
    disconnect: (topic: string) => Promise<void>
    onPair: (uri: string) => Promise<void>
}

type WalletConnectContextProviderProps = { children: React.ReactNode }
const WalletConnectContext = React.createContext<IWalletConnect>({
    disconnect: async () => {},
    onPair: async () => {},
})

const WalletConnectContextProvider = ({
    children,
}: WalletConnectContextProviderProps) => {
    // General
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { walletStatus } = useApplicationSecurity()
    const { onSessionRequest } = useWcRequest()
    const [linkingUrls, setLinkingUrls] = useState<string[]>([])

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

    const respondInvalidSession = useCallback(
        async (
            proposal: SignClientTypes.EventArguments["session_proposal"],
            err: JsonRpcError<any>,
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
                return respondInvalidSession(proposal, rpcErrors.internal())
            if (!proposal.params.requiredNamespaces.vechain) {
                showErrorToast({
                    text1: LL.NOTIFICATION_wallet_connect_incompatible_dapp(),
                })
                return respondInvalidSession(
                    proposal,
                    rpcErrors.invalidRequest(),
                )
            }

            nav.navigate(Routes.CONNECT_APP_SCREEN, {
                sessionProposal: proposal,
            })
        },
        [respondInvalidSession, nav, selectedAccountAddress, LL],
    )

    /**
     * Handle session delete
     */
    const disconnect = useCallback(
        async (topic: string, fromRemote = false) => {
            debug("Disconnecting session", topic, fromRemote)

            if (fromRemote) {
                showInfoToast({
                    text1: LL.NOTIFICATION_wallet_connect_disconnected_from_remote(),
                })
            } else {
                showSuccessToast({
                    text1: LL.NOTIFICATION_wallet_connect_disconnected_success(),
                })
            }
        },
        [LL],
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
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            if (web3Wallet.events.listenerCount("session_proposal") >= 1) {
                debug("Removing session_proposal listener")
                web3Wallet.events.removeAllListeners("session_proposal")
            }

            if (web3Wallet.events.listenerCount("session_request") >= 1) {
                debug("Removing session_request listener")
                web3Wallet.events.removeAllListeners("session_request")
            }

            if (web3Wallet.events.listenerCount("session_delete") >= 1) {
                debug("Removing session_delete listener")
                web3Wallet.events.removeAllListeners("session_delete")
            }

            debug("Adding new Web3Wallet event listeners")
            web3Wallet.on("session_proposal", onSessionProposal)
            web3Wallet.on("session_request", onSessionRequest)
            web3Wallet.on("session_delete", onSessionDelete)
        })()
    }, [onSessionRequest, onSessionDelete, onSessionProposal])

    useEffect(() => {
        Linking.getInitialURL().then(url => {
            debug("WalletConnectProvider:Linking.getInitialURL", url)
            if (url) {
                setLinkingUrls(prev => [...prev, url])
            }
        })
    }, [handleLinkingUrl])

    /**
     * Sets up a listener for DApp session proposals
     * - Don't set any dependencies here, otherwise the listener will be added multiple times (there was trouble removing, screen crashes etc.)
     */
    useEffect(() => {
        Linking.addListener("url", event => {
            debug("WalletConnectProvider:Linking.addListener", event)
            setLinkingUrls(prev => [...prev, event.url])
        })
    }, [])

    useEffect(() => {
        if (linkingUrls.length > 0 && walletStatus === WALLET_STATUS.UNLOCKED) {
            const firstUrl = linkingUrls[0]

            setLinkingUrls(prev => prev.filter(url => url !== firstUrl))

            handleLinkingUrl(firstUrl)
        }
    }, [walletStatus, handleLinkingUrl, linkingUrls])

    // Needed for the context
    const value: IWalletConnect = useMemo(() => {
        return {
            disconnect,
            onPair,
        }
    }, [disconnect, onPair])

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
