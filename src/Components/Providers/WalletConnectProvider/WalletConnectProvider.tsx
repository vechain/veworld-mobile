import React, { useCallback, useEffect, useMemo, useState } from "react"
import { debug, error, WalletConnectUtils, warn } from "~Utils"
import { IWeb3Wallet } from "@walletconnect/web3wallet"
import { SignClientTypes } from "@walletconnect/types"
import {
    deleteSession,
    selectSelectedAccountAddress,
    selectSessionsFlat,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    useApplicationSecurity,
} from "~Components"
import { useI18nContext } from "~i18n"
import { getSdkError } from "@walletconnect/utils"
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
    const activeSessionsFlat = useAppSelector(selectSessionsFlat)
    const { walletStatus } = useApplicationSecurity()
    const { onSessionRequest } = useWcRequest(web3Wallet)
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

            if (activeSessionsFlat.some(s => s.topic === topic)) {
                return
            }

            try {
                await web3Wallet?.core.pairing.pair({
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

    const respondInvalidSession = useCallback(
        async (
            proposal: SignClientTypes.EventArguments["session_proposal"],
            err: JsonRpcError<any>,
        ) => {
            if (!web3Wallet) return

            await web3Wallet.rejectSession({
                id: proposal.id,
                reason: {
                    code: err.code,
                    message: err.message,
                },
            })
        },
        [web3Wallet],
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
            if (!web3Wallet)
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
        [respondInvalidSession, nav, selectedAccountAddress, web3Wallet, LL],
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
                    showInfoToast({
                        text1: LL.NOTIFICATION_wallet_connect_disconnected_from_remote(),
                    })
                } else {
                    showSuccessToast({
                        text1: LL.NOTIFICATION_wallet_connect_disconnected_success(),
                    })
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
            if (!web3Wallet) {
                const web3WalletInstance =
                    await WalletConnectUtils.getWeb3Wallet()
                setWeb3wallet(web3WalletInstance)
            }
        })()
    }, [web3Wallet])

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

    /**
     * Remove expired sessions
     */
    useEffect(() => {
        activeSessionsFlat.forEach(session => {
            if (session.expiry < Date.now() / 1000) {
                disconnect(session.topic)
            }
        })
    }, [disconnect, activeSessionsFlat])

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
