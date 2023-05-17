import { Image, Modal, StyleSheet } from "react-native"
import { SignClientTypes } from "@walletconnect/types"
import React from "react"
import { BaseText, BaseButton, BaseView } from "~Components"

interface PairingModalProps {
    visible: boolean
    setModalVisible: (arg1: boolean) => void
    currentProposal:
        | SignClientTypes.EventArguments["session_proposal"]
        | undefined
    handleAccept: () => void
    handleReject: () => void
}

export default function PairingModal({
    visible,
    currentProposal,
    handleAccept,
    handleReject,
}: PairingModalProps) {
    const name = currentProposal?.params?.proposer?.metadata?.name
    const url = currentProposal?.params?.proposer?.metadata.url
    const methods = currentProposal?.params?.requiredNamespaces.vechain.methods
    const events = currentProposal?.params?.requiredNamespaces.vechain.events
    const chains = currentProposal?.params?.requiredNamespaces.vechain.chains
    const icon = currentProposal?.params.proposer.metadata.icons[0]

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <BaseView style={styles.container}>
                <BaseView style={styles.modalContentContainer}>
                    <Image
                        style={styles.dappLogo}
                        source={{
                            uri: icon,
                        }}
                    />
                    <BaseText>{name}</BaseText>
                    <BaseText>{url}</BaseText>

                    <BaseText>
                        {"Chains: "} {chains}
                    </BaseText>

                    <BaseView style={styles.marginVertical8}>
                        <BaseText style={styles.subHeading}>
                            {"Methods: "}
                        </BaseText>
                        {methods?.map((method, index) => (
                            <BaseText
                                style={styles.centerText}
                                key={method + index}>
                                {method}
                            </BaseText>
                        ))}
                    </BaseView>

                    <BaseView style={styles.marginVertical8}>
                        <BaseText style={styles.subHeading}>
                            {"Events: "}
                        </BaseText>
                        {events?.map(event => (
                            <BaseText style={styles.centerText} key={event}>
                                {event}
                            </BaseText>
                        ))}
                    </BaseView>

                    <BaseView style={styles.flexRow}>
                        <BaseButton action={handleReject} title="Cancel" />
                        <BaseButton action={handleAccept} title="Accept" />
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
    flexRow: {
        display: "flex",
        flexDirection: "row",
    },
    marginVertical8: {
        marginVertical: 8,
        textAlign: "center",
    },
    subHeading: {
        textAlign: "center",
        fontWeight: "600",
    },
    centerText: {
        textAlign: "center",
    },
})
