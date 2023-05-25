import React, { useState, useEffect, useMemo, useCallback } from "react"
import { WalletConnectUtils } from "~Utils"
import { IWeb3Wallet } from "@walletconnect/web3wallet"
import { SignClientTypes, SessionTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import {
    selectSelectedAccount,
    useAppSelector,
    useAppDispatch,
} from "~Storage/Redux"
import PairingModal from "../../Screens/PairingModal"
import SignModal from "../../Screens/SignModal"
import { addSession, removeSession } from "~Storage/Redux/Actions/WalletConnect"
import { showSuccessToast } from "~Components"
import { useI18nContext } from "~i18n"

type WalletConnectContextProviderProps = { children: React.ReactNode }
const WalletConnectContext = React.createContext<IWeb3Wallet | undefined>(
    undefined,
)
const WalletConnectContextProvider = ({
    children,
}: WalletConnectContextProviderProps) => {
    //For session proposal
    const [web3Wallet, setWeb3wallet] = useState<IWeb3Wallet>()
    const [pairingModalVisible, setPairingModalVisible] = useState(false)
    const [currentProposal, setCurrentProposal] =
        useState<SignClientTypes.EventArguments["session_proposal"]>()

    // For session request
    const [signModalVisible, setSignModalVisible] = useState(false)
    const [requestSession, setRequestSession] = useState()
    const [requestEventData, setRequestEventData] =
        useState<SignClientTypes.EventArguments["session_request"]>()

    // General
    const account = useAppSelector(selectSelectedAccount)
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
            setPairingModalVisible(true)
            setCurrentProposal(proposal)
        },
        [],
    )

    const handleProposalAccept = async () => {
        const { id, params } = currentProposal
        const { requiredNamespaces, relays } = params

        // console.log("Accepting request to pair")

        if (currentProposal) {
            const namespaces: SessionTypes.Namespaces = {}

            Object.keys(requiredNamespaces).forEach(key => {
                const accounts: string[] = []
                requiredNamespaces[key].chains.map((chain: string) => {
                    ;[account?.address].map(acc =>
                        accounts.push(`${chain}:${acc}`),
                    )
                })

                namespaces[key] = {
                    accounts,
                    methods: requiredNamespaces[key].methods,
                    events: requiredNamespaces[key].events,
                }
            })

            // console.log("Returning approve session")

            let session = await web3Wallet?.approveSession({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
            })

            // console.log("Finalizing session")
            dispatch(addSession(session))
            setPairingModalVisible(false)
            setCurrentProposal(undefined)

            showSuccessToast(
                LL.NOTIFICATION_wallet_connect_successfull_pairing(),
            )
        }
    }

    async function handleProposalReject() {
        const { id } = currentProposal

        if (currentProposal) {
            await web3Wallet?.rejectSession({
                id,
                reason: getSdkError("USER_REJECTED_METHODS"),
            })

            setPairingModalVisible(false)
            setCurrentProposal(undefined)
        }
    }

    /**
     * Handle session request
     */
    const onSessionRequest = useCallback(
        async (
            requestEvent: SignClientTypes.EventArguments["session_request"],
        ) => {
            const { topic } = requestEvent
            // const { request } = params
            // console.log("new request")

            const requestSessionData =
                web3Wallet?.engine.signClient.session.get(topic)

            // console.log("request session data found for topic: ", topic)
            setRequestSession(requestSessionData)
            setRequestEventData(requestEvent)
            setSignModalVisible(true)
        },
        [web3Wallet],
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
            <PairingModal
                handleAccept={handleProposalAccept}
                handleReject={handleProposalReject}
                visible={pairingModalVisible}
                setModalVisible={setPairingModalVisible}
                currentProposal={currentProposal}
            />

            <SignModal
                visible={signModalVisible}
                setModalVisible={setSignModalVisible}
                requestEvent={requestEventData}
                requestSession={requestSession}
            />
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
