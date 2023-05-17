import { web3wallet } from "../Common/Utils/WalletConnect/WalletConnectUtils"
import { SignClientTypes } from "@walletconnect/types"
import {
    approveRequest,
    rejectRequest,
} from "~Common/Utils/WalletConnect/Requests"
import React from "react"
import { Image, Modal, StyleSheet } from "react-native"
import { getSignParamsMessage } from "../Common/Utils/WalletConnect/Helpers"
import { BaseText, BaseButton, BaseView } from "~Components"

interface SignModalProps {
    visible: boolean
    setModalVisible: (arg1: boolean) => void
    requestSession: any
    requestEvent: SignClientTypes.EventArguments["session_request"] | undefined
}

export default function SignModal({
    visible,
    setModalVisible,
    requestEvent,
    requestSession,
}: SignModalProps) {
    if (!requestEvent || !requestSession) return null

    // console.log("SIGNING MESSAGE", requestEvent?.params?.request?.params)

    // CurrentProposal values
    const chainID = requestEvent?.params?.chainId?.toUpperCase()
    const method = requestEvent?.params?.request?.method
    const message = getSignParamsMessage(requestEvent?.params?.request?.params)
    const requestName = requestSession?.peer?.metadata?.name
    const requestIcon = requestSession?.peer?.metadata?.icons[0]
    const requestURL = requestSession?.peer?.metadata?.url

    const { topic } = requestEvent

    async function onApprove() {
        if (requestEvent) {
            const response = await approveRequest(requestEvent)
            await web3wallet.respondSessionRequest({
                topic,
                response,
            })
            setModalVisible(false)
        }
    }

    async function onReject() {
        if (requestEvent) {
            const response = rejectRequest(requestEvent)
            await web3wallet.respondSessionRequest({
                topic,
                response,
            })
            setModalVisible(false)
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <BaseView style={styles.container}>
                <BaseView style={styles.modalContentContainer}>
                    <Image
                        style={styles.dappLogo}
                        source={{
                            uri: requestIcon,
                        }}
                    />

                    <BaseText>{requestName}</BaseText>
                    <BaseText>{requestURL}</BaseText>

                    <BaseText>{message}</BaseText>

                    <BaseText>
                        {"Chains: "}
                        {chainID}
                    </BaseText>

                    <BaseView style={styles.marginVertical8}>
                        <BaseText style={styles.subHeading}>
                            {"Method:"}
                        </BaseText>
                        <BaseText>{method}</BaseText>
                    </BaseView>

                    <BaseView>
                        <BaseButton action={onReject} title="Cancel" />
                        <BaseButton action={onApprove} title="Accept" />
                    </BaseView>
                </BaseView>
            </BaseView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modalContentContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 34,
        borderWidth: 1,
        width: "100%",
        height: "50%",
        position: "absolute",
        backgroundColor: "white",
        bottom: 0,
    },
    dappLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginVertical: 4,
    },
    marginVertical8: {
        marginVertical: 8,
    },
    subHeading: {
        textAlign: "center",
        fontWeight: "600",
    },
})
