import { SignClientTypes } from "@walletconnect/types"
import React, { useCallback } from "react"
import { Image, StyleSheet } from "react-native"
import {
    BaseText,
    BaseButton,
    BaseView,
    useThor,
    useWalletConnect,
    showErrorToast,
    BaseSpacer,
    showWarningToast,
    BaseModal,
    showSuccessToast,
} from "~Components"
import { HDNode, secp256k1, Transaction } from "thor-devkit"
import {
    selectSelectedNetwork,
    useAppSelector,
    selectDevice,
    selectSelectedAccount,
} from "~Storage/Redux"
import { HexUtils, CryptoUtils, TransactionUtils } from "~Utils"
import { useCheckIdentity, error } from "~Common"
import { DEVICE_TYPE, Wallet } from "~Model"
import axios from "axios"
import { formatJsonRpcError } from "@json-rpc-tools/utils"
import { getSdkError } from "@walletconnect/utils"

interface Props {
    sessionRequest: any
    requestEvent: SignClientTypes.EventArguments["session_request"]
    onClose: () => void
    isOpen: boolean
}

export const SignTransactionModal = ({
    requestEvent,
    sessionRequest,
    onClose,
    isOpen,
}: Props) => {
    const { web3Wallet } = useWalletConnect()
    const thorClient = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    // const selectedDevice = useAppSelector(selectDevice(account.rootAddress))
    const selectedDevice = useAppSelector(state =>
        selectDevice(state, account.rootAddress),
    )

    // CurrentProposal values
    const chainID = requestEvent?.params?.chainId?.toUpperCase()
    const method = requestEvent?.params?.request?.method
    const params = requestEvent?.params?.request?.params[0]
    const requestName = sessionRequest?.peer?.metadata?.name
    const requestIcon = sessionRequest?.peer?.metadata?.icons[0]
    const requestURL = sessionRequest?.peer?.metadata?.url

    const message = params.comment || params.txMessage[0].comment

    const { topic } = requestEvent ? requestEvent : { topic: "" }

    const onSignTransaction = useCallback(
        async (id: number, privateKey: Buffer) => {
            const clauses = params.txMessage

            // TODO: calc intrinsic gas
            // const gas = Transaction.intrinsicGas(clauses)

            const transaction: Transaction.Body = {
                chainTag: parseInt(thorClient.genesis.id.slice(-2), 16),
                blockRef: thorClient.status.head.id.slice(0, 18),
                expiration: 18,
                clauses: clauses,
                gasPriceCoef: 0,
                gas: 8000000,
                dependsOn: null,
                nonce: HexUtils.generateRandom(8),
            }

            let encodedRawTx, tx: Transaction
            if (params.delegateUrl !== undefined && params.delegateUrl !== "") {
                tx = TransactionUtils.toDelegation(transaction)
                // build hex encoded version of the transaction for signing request
                const rawTransaction = HexUtils.addPrefix(
                    tx.encode().toString("hex"),
                )

                // request to send for sponsorship/fee delegation
                const sponsorRequest = {
                    origin: account.address.toLowerCase(),
                    raw: rawTransaction,
                }

                const response = await axios
                    .post(params.delegateUrl, sponsorRequest)
                    .catch(async e => {
                        const formattedResponse = formatJsonRpcError(
                            id,
                            e.message
                                ? e.message
                                : "Unexpected error while executing transaction",
                        )

                        await web3Wallet?.respondSessionRequest({
                            topic,
                            response: formattedResponse,
                        })
                    })

                if (
                    !response ||
                    response.data.error ||
                    !response.data.signature
                ) {
                    showErrorToast(
                        "An error occurred while asking delegator to sign the transaction",
                    )
                    onClose()
                    return
                }

                const urlDelegationSignature = Buffer.from(
                    response.data.signature.substr(2),
                    "hex",
                )

                const hash = tx.signingHash()
                const senderSignature = secp256k1.sign(hash, privateKey)

                const delegationSignature = Buffer.concat([
                    senderSignature,
                    urlDelegationSignature,
                ])

                tx.signature = delegationSignature

                encodedRawTx = {
                    raw: HexUtils.addPrefix(tx.encode().toString("hex")),
                }
            } else {
                tx = new Transaction(transaction)

                const hash = tx.signingHash()
                const senderSignature = secp256k1.sign(hash, privateKey)
                const signature = Buffer.concat([senderSignature])
                tx.signature = signature

                encodedRawTx = {
                    raw: HexUtils.addPrefix(tx.encode().toString("hex")),
                }
            }

            await axios
                .post(`${network.currentUrl}/transactions`, encodedRawTx)
                .then(async response => {
                    await web3Wallet?.respondSessionRequest({
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

                    showSuccessToast("Transaction broadcasted correctly")

                    //TODO: add to history
                })
                .catch(async e => {
                    const response = formatJsonRpcError(
                        id,
                        e.message
                            ? e.message
                            : "An unexpected error occurred while executing transaction",
                    )

                    await web3Wallet.respondSessionRequest({
                        topic,
                        response,
                    })

                    showErrorToast(
                        e.message
                            ? e.message
                            : "An unexpected error occurred while executing transaction",
                    )
                })

            onClose()
        },
        [account, network, params, thorClient, topic, web3Wallet, onClose],
    )

    const onApprove = useCallback(
        async (decryptedWallet: Wallet) => {
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

            await onSignTransaction(id, privateKey)
        },
        [account, requestEvent, onSignTransaction],
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
        }

        onClose()
    }

    const onIdentityConfirmed = useCallback(
        async (password?: string) => {
            if (!selectedDevice) return

            //TODO: support ledger
            if (selectedDevice.type === DEVICE_TYPE.LEDGER) {
                showWarningToast("Hardware wallet not supported yet")
                return
            }

            //local mnemonic, identity already verified via useCheckIdentity
            if (!selectedDevice.wallet) {
                // TODO: support hardware wallet
                showWarningToast("Hardware wallet not supported yet")
            }
            const { decryptedWallet } = await CryptoUtils.decryptWallet(
                selectedDevice,
                password,
            )

            onApprove(decryptedWallet)
        },
        [onApprove, selectedDevice],
    )

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed,
        })

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            animationType="fade"
            presentationStyle="overFullScreen">
            <BaseView alignItems="center" justifyContent="center">
                <BaseText typographyFont="subTitleBold">
                    {"Sign Transaction Re"}
                </BaseText>
            </BaseView>
            <BaseView>
                <BaseView alignItems="center" justifyContent="center">
                    <Image
                        style={styles.dappLogo}
                        source={{
                            uri: requestIcon,
                        }}
                    />
                    <BaseText>{requestName}</BaseText>
                    <BaseText>{requestURL}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

                <BaseText>
                    {"Chains: "}
                    {chainID}
                </BaseText>

                <BaseSpacer height={24} />

                <BaseView>
                    <BaseText>{"Method:"}</BaseText>
                    <BaseText>{method}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

                <BaseView>
                    <BaseText>{"Message:"}</BaseText>
                    <BaseText>{message}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

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
            <ConfirmIdentityBottomSheet />
        </BaseModal>
    )
}

const styles = StyleSheet.create({
    dappLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginVertical: 4,
    },
})
