import { SignClientTypes } from "@walletconnect/types"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
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
    CloseModalButton,
} from "~Components"
import { HDNode, secp256k1, Transaction } from "thor-devkit"
import {
    selectSelectedNetwork,
    useAppSelector,
    selectDevice,
    selectSelectedAccount,
} from "~Storage/Redux"
import {
    HexUtils,
    CryptoUtils,
    TransactionUtils,
    WalletConnectUtils,
} from "~Utils"
import { useCheckIdentity, error } from "~Common"
import { DEVICE_TYPE, Wallet } from "~Model"
import axios from "axios"
import { formatJsonRpcError } from "@json-rpc-tools/utils"
import { getSdkError } from "@walletconnect/utils"
import { isEmpty, isUndefined } from "lodash"
import { useI18nContext } from "~i18n"
import { ScrollView } from "react-native-gesture-handler"
import { ConnectedApp } from "~Screens/Flows/App/WalletConnectScreen/components"

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
    const selectedDevice = useAppSelector(state =>
        selectDevice(state, account.rootAddress),
    )
    const { LL } = useI18nContext()

    // Session request values
    const { chainId, method, params, topic } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const message = params.comment || params.txMessage[0].comment

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

            if (
                isUndefined(params.delegateUrl) ||
                isEmpty(params.delegateUrl)
            ) {
                // if the dapp doesn't provide a delegateUrl, we sign the transaction locally

                tx = new Transaction(transaction)

                const hash = tx.signingHash()
                const senderSignature = secp256k1.sign(hash, privateKey)
                const signature = Buffer.concat([senderSignature])
                tx.signature = signature

                encodedRawTx = {
                    raw: HexUtils.addPrefix(tx.encode().toString("hex")),
                }
            } else {
                // if the dapp provides a delegateUrl, we ask the delegator to sign the transaction

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
                        LL.NOTIFICATION_wallet_connect_error_delegating_transaction(),
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
            }

            await axios
                .post(`${network.currentUrl}/transactions`, encodedRawTx)
                .then(async response => {
                    try {
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

                        showSuccessToast(
                            LL.NOTIFICATION_wallet_connect_transaction_broadcasted(),
                        )
                    } catch (e) {
                        showErrorToast(
                            "Transaction broadcasted correctly but an error occurred while responding to the dapp",
                        )
                    } finally {
                        //TODO: add to history
                    }
                })
                .catch(async e => {
                    const response = formatJsonRpcError(
                        id,
                        e.message
                            ? e.message
                            : LL.NOTIFICATION_wallet_connect_error_on_transaction(),
                    )

                    await web3Wallet?.respondSessionRequest({
                        topic,
                        response,
                    })

                    showErrorToast(
                        e.message
                            ? e.message
                            : LL.NOTIFICATION_wallet_connect_error_on_transaction(),
                    )
                })

            onClose()
        },
        [account, network, params, thorClient, topic, web3Wallet, onClose, LL],
    )

    const onApprove = useCallback(
        async (decryptedWallet: Wallet) => {
            if (!requestEvent) return

            const { id } = requestEvent

            if (!decryptedWallet)
                throw new Error("Mnemonic wallet can't be empty")

            if (decryptedWallet && !decryptedWallet.mnemonic)
                error("Mnemonic wallet can't have an empty mnemonic")

            if (!account.index && account.index !== 0)
                throw new Error("Account index is empty")

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

            await web3Wallet?.respondSessionRequest({
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
            <CloseModalButton onPress={onClose} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {"Send Transaction"}
                    </BaseText>

                    <BaseSpacer height={8} />
                    <BaseText typographyFont="subSubTitleLight">
                        {
                            "Your Signature is being requested to send a transaction"
                        }
                    </BaseText>

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitleBold">
                        {"Connected app"}
                    </BaseText>
                    <BaseSpacer height={8} />
                    <ConnectedApp
                        clickable={false}
                        session={sessionRequest}
                        account={account}
                    />

                    <BaseSpacer height={24} />
                    <BaseText>
                        {"Chains: "}
                        {chainId}
                    </BaseText>

                    <BaseSpacer height={24} />

                    <BaseText>{"Method:"}</BaseText>
                    <BaseText>{method}</BaseText>

                    <BaseSpacer height={24} />

                    <BaseText>{"Message:"}</BaseText>
                    <BaseText>{message}</BaseText>
                </BaseView>
            </ScrollView>
            <BaseSpacer height={24} />
            <BaseView style={styles.footer}>
                <BaseButton
                    w={100}
                    haptics="light"
                    title={"SIGN AND SEND"}
                    action={checkIdentityBeforeOpening}
                />
                <BaseSpacer height={16} />
                <BaseButton
                    w={100}
                    haptics="light"
                    variant="outline"
                    title={"REJECT"}
                    action={onReject}
                />
            </BaseView>
            <BaseSpacer height={40} />
            <ConfirmIdentityBottomSheet />
        </BaseModal>
    )
}

const styles = StyleSheet.create({
    dappLogo: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginVertical: 4,
    },
    alignLeft: {
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
        height: "60%",
    },
    scrollView: {
        width: "100%",
    },
    footer: {
        width: "100%",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 20,
    },
    separator: {
        borderWidth: 0.5,
        borderColor: "#0B0043",
        opacity: 0.56,
    },
})
