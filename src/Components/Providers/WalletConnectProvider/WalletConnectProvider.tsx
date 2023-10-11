import React, { useCallback, useEffect, useMemo } from "react"
import { error, WalletConnectUtils } from "~Utils"
import { useNavigation } from "@react-navigation/native"
import { useWcRequest } from "./hooks"
import { useSessionProposals } from "~Components/Providers/WalletConnectProvider/hooks/useSessionProposals"
import { useWcSessions } from "~Components/Providers/WalletConnectProvider/hooks/useWcSessions"
import { useWcPairing } from "~Components/Providers/WalletConnectProvider/hooks/useWcPairing"
import { useWcDeepLinking } from "~Components/Providers/WalletConnectProvider/hooks/useWcDeepLinking"
import { defaultTestNetwork, RequestMethods } from "~Constants"
import { blake2b256, Certificate, secp256k1 } from "thor-devkit"
import { Buffer } from "buffer"

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
    rejectPendingProposal: ReturnType<
        typeof useSessionProposals
    >["rejectPendingProposal"]
    approvePendingProposal: ReturnType<
        typeof useSessionProposals
    >["approvePendingProposal"]
    disconnectSession: ReturnType<typeof useWcSessions>["disconnectSession"]
    onPair: ReturnType<typeof useWcPairing>["onPair"]
    failRequest: ReturnType<typeof useWcRequest>["failRequest"]
    processRequest: ReturnType<typeof useWcRequest>["processRequest"]
    activeSessions: ReturnType<typeof useWcSessions>["activeSessions"]
}

type WalletConnectContextProviderProps = { children: React.ReactNode }
const WalletConnectContext = React.createContext<WCContext>({} as WCContext)

const WalletConnectContextProvider = ({
    children,
}: WalletConnectContextProviderProps) => {
    // General
    const nav = useNavigation()

    const isBlackListScreen = useCallback((): boolean => {
        if (!nav) return true

        return !WalletConnectUtils.shouldAutoNavigate(nav.getState())
    }, [nav])

    const {
        addSessionDisconnect,
        disconnectSession,
        activeSessions,
        addSession,
    } = useWcSessions()

    const {
        addPendingProposal,
        rejectPendingProposal,
        approvePendingProposal,
    } = useSessionProposals(isBlackListScreen, addSession)

    const { addPendingRequest, failRequest, processRequest } = useWcRequest(
        isBlackListScreen,
        activeSessions,
    )

    const { onPair } = useWcPairing(activeSessions)

    useWcDeepLinking(onPair)

    /**
     * Execute at start
     */
    useEffect(() => {
        ;(async () => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            for (const event of [
                "session_proposal",
                "session_request",
                "session_delete",
            ]) {
                if (web3Wallet.events.listenerCount(event) > 0) {
                    error(
                        `Wallet Connect Provider: ${event} listener already exists`,
                    )
                }
            }

            web3Wallet.on("session_proposal", proposal => {
                // addPendingProposal(proposal)
                // TODO: We're sending response back instantly when WC stops working. This seems to work
                const {
                    id,
                    params: { relays },
                } = proposal

                error("Hardcoding approval for proposal", id)

                web3Wallet.approveSession({
                    id,
                    namespaces: {
                        vechain: {
                            accounts: [
                                `vechain:${defaultTestNetwork.genesis.id.slice(
                                    -32,
                                )}:0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa`,
                            ],
                            methods: Object.values(RequestMethods),
                            events: [],
                        },
                    },
                    relayProtocol: relays[0].protocol,
                })
            })
            web3Wallet.on("session_request", request => {
                // addPendingRequest(request)
                // TODO: We're sending response back instantly when WC stops working. This seems to work
                error("Hardcoding response for request", request.params.request)

                const message: Connex.Vendor.CertMessage =
                    request.params.request.params[0].message

                const certificate: Certificate = {
                    purpose: message.purpose,
                    payload: message.payload,
                    timestamp: Math.round(Date.now() / 1000),
                    domain: new URL("https://veworld-dapp-vecha.in").hostname,
                    signer: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa".toLowerCase(),
                }

                const privateKey =
                    "99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36"

                const certHash = blake2b256(Certificate.encode(certificate))

                const signature = secp256k1.sign(
                    certHash,
                    Buffer.from(privateKey, "hex"),
                )

                const result: Connex.Vendor.CertResponse = {
                    annex: {
                        domain: certificate.domain,
                        timestamp: certificate.timestamp,
                        signer: certificate.signer,
                    },
                    signature: "0x" + signature.toString("hex"),
                }

                error("Hardcoded response", result)

                web3Wallet.respondSessionRequest({
                    topic: request.topic,
                    response: {
                        id: request.id,
                        result,
                        jsonrpc: "2.0",
                    },
                })
            })
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
