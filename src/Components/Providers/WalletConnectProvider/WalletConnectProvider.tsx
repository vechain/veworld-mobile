import React, { useCallback, useEffect, useMemo, useState } from "react"
import { debug, error, WalletConnectUtils } from "~Utils"
import { useApplicationSecurity, useWcSessions } from "~Components"
import { WALLET_STATUS } from "~Model"
import { Linking } from "react-native"
import { useWcRequest } from "./hooks"
import { IWeb3WalletEngine } from "@walletconnect/web3wallet/dist/types/types/engine"
import { cloneDeep } from "lodash"
import { SignClientTypes } from "@walletconnect/types"
import { useNavigation } from "@react-navigation/native"

/**
 * Wallet Connect Flow:
 * 1) A pairing needs to be established by scanning the QR code or by manually pasting the URI
 * 2) After pairing is established the dapp will send a session_proposal asking the user permission to connect to the wallet
 * 3) Once the dapp and the wallet are connected the dapp can send session_requests asking to sign certificates or execute transactions
 *
 * This provider was created to have a singleton web3wallet instance, so that all modals regarding session proposals and requests
 * are handled by the provider can be shown no matter where we are inside the app.
 */

export type ActiveSessions = ReturnType<IWeb3WalletEngine["getActiveSessions"]>

export type WcSessionProposal =
    SignClientTypes.EventArguments["session_proposal"]
export type WcSessionRequest = SignClientTypes.EventArguments["session_request"]
export type WcSessionDelete = SignClientTypes.EventArguments["session_delete"]

type IWalletConnect = {
    activeSessions: ActiveSessions
    onPair: ReturnType<typeof useWcSessions>["onPair"]
    approveSession: ReturnType<typeof useWcSessions>["approveSession"]
    disconnectSession: ReturnType<typeof useWcSessions>["disconnectSession"]
}

type WalletConnectContextProviderProps = { children: React.ReactNode }

const WalletConnectContext = React.createContext<IWalletConnect>({
    activeSessions: {},
    onPair: () => Promise.reject(),
    approveSession: () => Promise.reject(),
    disconnectSession: () => Promise.reject(),
})

const WalletConnectContextProvider = ({
    children,
}: WalletConnectContextProviderProps) => {
    // General
    const [activeSessions, setActiveSessions] = useState<ActiveSessions>({})

    const { walletStatus } = useApplicationSecurity()
    const { onSessionRequest } = useWcRequest()
    const {
        onSessionDelete,
        onSessionProposal,
        onPair,
        approveSession,
        disconnectSession,
    } = useWcSessions(setActiveSessions)

    const nav = useNavigation()

    const [linkingUrls, setLinkingUrls] = useState<string[]>([])

    const [sessionProposals, setSessionProposals] = useState<
        Record<string, WcSessionProposal>
    >({})
    const [sessionRequests, setSessionRequests] = useState<
        Record<string, WcSessionRequest>
    >({})
    const [sessionDeletes, setSessionDeletes] = useState<
        Record<string, WcSessionDelete>
    >({})

    useEffect(() => {
        if (!nav || !WalletConnectUtils.shouldAutoNavigate(nav.getState()))
            return

        const proposalKeys = Object.keys(sessionProposals)

        if (proposalKeys.length > 0) {
            const proposal = cloneDeep(sessionProposals[proposalKeys[0]])

            debug("Processing WC Session Proposal", proposal.id)

            setSessionProposals(prev => {
                const newState = { ...prev }
                delete newState[proposal.id]
                return newState
            })

            onSessionProposal(proposal)
        }
    }, [nav, sessionProposals, onSessionProposal])

    useEffect(() => {
        if (!nav || !WalletConnectUtils.shouldAutoNavigate(nav.getState()))
            return

        const requestKeys = Object.keys(sessionRequests)

        if (requestKeys.length > 0) {
            const request = sessionRequests[requestKeys[0]]

            debug("Processing WC Session Request", request.id)

            setSessionRequests(prev => {
                const newState = { ...prev }
                delete newState[request.id]
                return newState
            })

            onSessionRequest(request)
        }
    }, [nav, onSessionRequest, sessionRequests])

    useEffect(() => {
        const deleteKeys = Object.keys(sessionDeletes)

        if (deleteKeys.length > 0) {
            const _delete = cloneDeep(sessionDeletes[deleteKeys[0]])

            debug("Processing WC Session Delete", _delete.id)

            setSessionDeletes(prev => {
                const newState = { ...prev }
                delete newState[_delete.id]
                return newState
            })

            onSessionDelete(_delete)
        }
    }, [sessionDeletes, onSessionDelete])

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
     * Initialise the Web3Wallet and add event listeners
     */
    useEffect(() => {
        ;(async () => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            web3Wallet.on("session_proposal", proposal => {
                setSessionProposals(prev => ({
                    ...prev,
                    [proposal.id]: proposal,
                }))
            })
            web3Wallet.on("session_request", request => {
                setSessionRequests(prev => ({
                    ...prev,
                    [request.id]: request,
                }))
            })
            web3Wallet.on("session_delete", _delete => {
                setSessionDeletes(prev => ({
                    ...prev,
                    [_delete.id]: _delete,
                }))
            })
        })()
    }, [])

    /**
     * Handle initial linking URL
     */
    useEffect(() => {
        Linking.getInitialURL().then(url => {
            debug("WalletConnectProvider:Linking.getInitialURL", url)
            if (url) {
                setLinkingUrls(prev => [...prev, url])
            }
        })
    }, [])

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
                .then(() => {
                    debug("WalletConnectProvider:handleLinkingUrl done")
                })
                .catch(e => {
                    error("WalletConnectProvider:handleLinkingUrl", e)
                })
        }
    }, [walletStatus, handleLinkingUrl, linkingUrls])

    const value: IWalletConnect = useMemo(() => {
        return {
            activeSessions,
            approveSession,
            onPair,
            disconnectSession,
        }
    }, [activeSessions, approveSession, onPair, disconnectSession])

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
