import { SignClientTypes } from "@walletconnect/types"
import React, { useCallback } from "react"
import { Image, Modal, StyleSheet } from "react-native"
import {
    BaseText,
    BaseButton,
    BaseView,
    useThor,
    useWalletConnect,
} from "~Components"
import {
    HDNode,
    secp256k1,
    Certificate,
    blake2b256,
    Transaction,
} from "thor-devkit"
import {
    selectSelectedNetwork,
    selectSelectedAccount,
    useAppSelector,
    selectDevice,
} from "~Storage/Redux"
import { HexUtils, error, CryptoUtils, useCheckIdentity } from "~Common"
import { Wallet } from "~Model"
import axios from "axios"
import { formatJsonRpcError } from "@json-rpc-tools/utils"
import { getSdkError } from "@walletconnect/utils"
import { VECHAIN_SIGNING_METHODS } from "../Utils/WalletConnectUtils/Lib"

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
    const web3Wallet = useWalletConnect()
    const thorClient = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const selectedDevice = useAppSelector(selectDevice(account?.rootAddress))
    // console.log("SignModal requestEvent", requestEvent)

    // CurrentProposal values
    const chainID = requestEvent?.params?.chainId?.toUpperCase()
    const method = requestEvent?.params?.request?.method
    const params = requestEvent?.params?.request?.params[0]
    const requestName = requestSession?.peer?.metadata?.name
    const requestIcon = requestSession?.peer?.metadata?.icons[0]
    const requestURL = requestSession?.peer?.metadata?.url

    // console.log("params", params);

    let message: string = ""
    switch (method) {
        case VECHAIN_SIGNING_METHODS.IDENTIFY:
            message = params.payload.content
            break
        case VECHAIN_SIGNING_METHODS.TEST_DELEGATE:
            message = params.comment
            break
        default:
            break
    }

    const { topic } = requestEvent ? requestEvent : { topic: "" }
    // console.log("SignModal topic", topic)

    const signIdentityCertificate = useCallback(
        async (id: number, privateKey: Buffer) => {
            const cert: Certificate = {
                ...params,
                timestamp: Math.round(Date.now() / 1000),
                domain: new URL(requestURL),
                signer: account ? account.address : "",
            }

            const hash = blake2b256(Certificate.encode(cert))
            const signature = secp256k1.sign(hash, privateKey)

            // console.log("respondSessionRequest with topic", topic)
            await web3Wallet.respondSessionRequest({
                topic,
                response: {
                    id,
                    jsonrpc: "2.0",
                    result: {
                        annex: {
                            timestamp: cert.timestamp,
                            domain: cert.domain,
                            signer: cert.signer,
                        },
                        signature: HexUtils.addPrefix(
                            signature.toString("hex"),
                        ),
                    },
                },
            })
        },
        [account, params, requestURL, topic, web3Wallet],
    )

    const onTestDelegate = useCallback(
        async (id: number, privateKey: Buffer) => {
            // console.log('Delegating Transaction')

            const clauses = params.txMessage

            // calc intrinsic gas
            // const gas = Transaction.intrinsicGas(clauses)
            // console.log('Gas', gas)

            const transaction: Transaction.Body = {
                chainTag: parseInt(thorClient.genesis.id.slice(-2), 16),
                blockRef: thorClient.status.head.id.slice(0, 18),
                expiration: 18,
                clauses: clauses,
                gasPriceCoef: 0,
                gas: 4000000, //TODO: gas is not correct when calculate intrinsic gas
                dependsOn: null, // TODO: in extension it is null
                nonce: HexUtils.generateRandom(8),
            }

            // console.log('transaction', transaction);

            const tx = new Transaction(transaction)
            const hash = tx.signingHash()
            const senderSignature = secp256k1.sign(hash, privateKey)
            const signature = Buffer.concat([senderSignature])
            tx.signature = signature

            // console.log('tx', tx)

            const encodedRawTx = {
                raw: HexUtils.addPrefix(tx.encode().toString("hex")),
            }

            // console.log('encodedRawTx ', encodedRawTx)
            // console.log('Sending on: ', network.currentUrl)
            // console.log('With account ', account?.address)

            await axios
                .post(`${network.currentUrl}/transactions`, encodedRawTx)
                .then(async response => {
                    // console.log(response.data)
                    await web3Wallet.respondSessionRequest({
                        topic,
                        response: {
                            id,
                            jsonrpc: "2.0",
                            result: {
                                txid: response.data.id,
                                signer: account?.address,
                            },
                        },
                    })
                })
                .catch(async () => {
                    //TODO: ALERT ON SCREEN
                    // console.log('error ', JSON.stringify(error))

                    const response = formatJsonRpcError(
                        id,
                        getSdkError("USER_REJECTED_METHODS").message, //TODO: change error message
                    )

                    await web3Wallet.respondSessionRequest({
                        topic,
                        response,
                    })
                })
        },
        [account, network, params, thorClient, topic, web3Wallet],
    )

    const onApprove = useCallback(
        async (decryptedWallet: Wallet) => {
            // console.log("onApprove")
            if (!requestEvent) return

            const { id } = requestEvent

            if (!decryptedWallet)
                throw new Error("Mnemonic wallet can't be empty")

            if (decryptedWallet && !decryptedWallet.mnemonic)
                error("Mnemonic wallet can't have an empty mnemonic")

            if (!account?.index && account?.index !== 0)
                throw new Error("account index is empty")

            const hdNode = HDNode.fromMnemonic(decryptedWallet.mnemonic)
            const derivedNode = hdNode.derive(account.index)
            const privateKey = derivedNode.privateKey as Buffer

            // console.log("decrypted wallet")
            switch (method) {
                case VECHAIN_SIGNING_METHODS.IDENTIFY:
                    await signIdentityCertificate(id, privateKey)
                    break
                case VECHAIN_SIGNING_METHODS.TEST_DELEGATE:
                    await onTestDelegate(id, privateKey)
                    break
                default:
                    break
            }

            setModalVisible(false)
        },
        [
            account,
            requestEvent,
            setModalVisible,
            signIdentityCertificate,
            onTestDelegate,
            method,
        ],
    )

    async function onReject() {
        if (requestEvent) {
            const { id } = requestEvent
            const response = formatJsonRpcError(
                id,
                getSdkError("USER_REJECTED_METHODS").message,
            )

            await web3Wallet.respondSessionRequest({
                topic,
                response,
            })
            setModalVisible(false)
        }
    }

    const onIdentityConfirmed = useCallback(
        async (password?: string) => {
            if (!selectedDevice) return

            //local mnemonic, identity already verified via useCheckIdentity
            if ("wallet" in selectedDevice) {
                const { decryptedWallet } = await CryptoUtils.decryptWallet(
                    selectedDevice,
                    password,
                )

                onApprove(decryptedWallet)
            }
        },
        [onApprove, selectedDevice],
    )

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed,
        })

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

                    <BaseView style={styles.marginVertical8}>
                        <BaseText style={styles.subHeading}>
                            {"Message:"}
                        </BaseText>
                        <BaseText>{message}</BaseText>
                    </BaseView>

                    <BaseView
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="row">
                        <BaseButton action={onReject} title="Cancel" />
                        <BaseButton
                            title="Accept"
                            action={checkIdentityBeforeOpening}
                        />
                    </BaseView>
                </BaseView>
            </BaseView>
            <ConfirmIdentityBottomSheet />
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
        height: "70%",
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
