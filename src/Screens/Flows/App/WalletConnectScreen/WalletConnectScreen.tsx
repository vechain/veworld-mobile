import React, { useState, useEffect, useCallback } from "react"
import {
    BaseText,
    BackButtonHeader,
    BaseSafeArea,
    BaseSpacer,
    BaseButton,
    BaseTextInput,
    BaseView,
} from "~Components"
import useInitialization, {
    currentETHAddress,
    web3wallet,
    web3WalletPair,
} from "../../../../Common/Utils/WalletConnect/WalletConnectUtils"
import PairingModal from "../../../PairingModal"
import { SignClientTypes, SessionTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import { VECHAIN_SIGNING_METHODS } from "../../../../Common/Utils/WalletConnect/Lib"
import SignModal from "../../../SignModal"

export const WalletConnectScreen = () => {
    //Add Initialization
    useInitialization()

    const [modalVisible, setModalVisible] = useState(false)

    const [currentProposal, setCurrentProposal] = useState()
    const [successfulSession, setSuccessfulSession] = useState(false)

    const [requestSession, setRequestSession] = useState()
    const [requestEventData, setRequestEventData] = useState()
    const [signModalVisible, setSignModalVisible] = useState(false)

    const [uri, setUri] = useState("")

    //Add the pairing function from W3W
    async function pair() {
        // console.log("Pairing uri", uri)
        const pairing = await web3WalletPair({ uri: uri })
        return pairing
    }

    // After the pair() function, add these functions: onSessionProposal / handleAccept / handleReject
    const onSessionProposal = useCallback(
        (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
            setModalVisible(true)
            setCurrentProposal(proposal)
        },
        [],
    )

    async function handleAccept() {
        const { id, params } = currentProposal
        const { requiredNamespaces, relays } = params

        if (currentProposal) {
            const namespaces: SessionTypes.Namespaces = {}

            Object.keys(requiredNamespaces).forEach(key => {
                const accounts: string[] = []
                requiredNamespaces[key].chains.map((chain: string) => {
                    ;[currentETHAddress].map(acc =>
                        accounts.push(`${chain}:${acc}`),
                    )
                })

                namespaces[key] = {
                    accounts,
                    methods: requiredNamespaces[key].methods,
                    events: requiredNamespaces[key].events,
                }
            })

            await web3wallet.approveSession({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
            })

            setModalVisible(false)
            setUri("")
            setCurrentProposal(undefined)
            setSuccessfulSession(true)
        }
    }

    async function disconnect() {
        const activeSessions = await web3wallet.getActiveSessions()
        const topic = Object.values(activeSessions)[0].topic

        if (activeSessions) {
            await web3wallet.disconnectSession({
                topic,
                reason: getSdkError("USER_DISCONNECTED"),
            })
        }
        setSuccessfulSession(false)
    }

    async function handleReject() {
        const { id } = currentProposal

        if (currentProposal) {
            await web3wallet.rejectSession({
                id,
                reason: getSdkError("USER_REJECTED_METHODS"),
            })

            setModalVisible(false)
            setUri("")
            setCurrentProposal(undefined)
        }
    }

    const onSessionRequest = useCallback(
        async (
            requestEvent: SignClientTypes.EventArguments["session_request"],
        ) => {
            const { topic, params } = requestEvent
            const { request } = params
            const requestSessionData =
                web3wallet.engine.signClient.session.get(topic)

            switch (request.method) {
                case VECHAIN_SIGNING_METHODS.ETH_SIGN:
                case VECHAIN_SIGNING_METHODS.PERSONAL_SIGN:
                    setRequestSession(requestSessionData)
                    setRequestEventData(requestEvent)
                    setSignModalVisible(true)
                    return
            }
        },
        [],
    )

    useEffect(() => {
        web3wallet?.on("session_proposal", onSessionProposal)
        web3wallet?.on("session_request", onSessionRequest)
    }, [onSessionRequest, onSessionProposal, successfulSession])

    return (
        <BaseSafeArea>
            <BackButtonHeader />
            <BaseText>{"Wallet Connect Screen"}</BaseText>

            <BaseSpacer height={24} />
            <BaseText>
                {"Address: "} {currentETHAddress || "Loading..."}
            </BaseText>
            <BaseSpacer height={24} />

            {!successfulSession ? (
                <BaseView alignItems="center" justifyContent="center">
                    <BaseTextInput
                        placeholder={"Place here the WC URI"}
                        label={"WC URI"}
                        setValue={setUri}
                        value={uri}
                        testID="wc-uri"
                    />
                    <BaseButton title="Connect" action={pair} />
                </BaseView>
            ) : (
                <BaseView alignItems="center" justifyContent="center">
                    <BaseText>{"Connected to DApp"}</BaseText>
                    <BaseButton action={disconnect} title="Disconnect" />
                </BaseView>
            )}

            <PairingModal
                handleAccept={handleAccept}
                handleReject={handleReject}
                visible={modalVisible}
                setModalVisible={setModalVisible}
                currentProposal={currentProposal}
            />

            <SignModal
                visible={signModalVisible}
                setModalVisible={setSignModalVisible}
                requestEvent={requestEventData}
                requestSession={requestSession}
            />
        </BaseSafeArea>
    )
}
