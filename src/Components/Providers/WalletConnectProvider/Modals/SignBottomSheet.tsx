import { SignClientTypes } from "@walletconnect/types"
import React, { useCallback, useMemo } from "react"
import { Image, StyleSheet } from "react-native"
import {
    BaseText,
    BaseButton,
    BaseView,
    useThor,
    useWalletConnect,
    showErrorToast,
    BaseBottomSheet,
    BaseSpacer,
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
    useAppSelector,
    selectDevice,
    selectSelectedAccount,
} from "~Storage/Redux"
import { HexUtils, CryptoUtils, TransactionUtils } from "~Utils"
import { useCheckIdentity, error } from "~Common"
import { Wallet } from "~Model"
import axios from "axios"
import { formatJsonRpcError } from "@json-rpc-tools/utils"
import { getSdkError } from "@walletconnect/utils"
import { VECHAIN_SIGNING_METHODS } from "~Utils/WalletConnectUtils/Lib"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

interface Props {
    requestSession: any
    requestEvent: SignClientTypes.EventArguments["session_request"] | undefined
    onClose: () => void
}

const snapPoints = ["80%"]

export const SignBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ requestEvent, requestSession, onClose }, ref) => {
        const web3Wallet = useWalletConnect()
        const thorClient = useThor()
        const network = useAppSelector(selectSelectedNetwork)
        const account = useAppSelector(selectSelectedAccount)
        const selectedDevice = useAppSelector(selectDevice(account.rootAddress))

        // CurrentProposal values
        const chainID = requestEvent?.params?.chainId?.toUpperCase()
        const method = requestEvent?.params?.request?.method
        const params = requestEvent?.params?.request?.params[0]
        const requestName = requestSession?.peer?.metadata?.name
        const requestIcon = requestSession?.peer?.metadata?.icons[0]
        const requestURL = requestSession?.peer?.metadata?.url

        const message = useMemo(() => {
            switch (method) {
                case VECHAIN_SIGNING_METHODS.IDENTIFY:
                    return params.payload.content
                case VECHAIN_SIGNING_METHODS.REQUEST_TRANSACTION:
                    return params.comment || params.txMessage[0].comment
                default:
                    return ""
            }
        }, [method, params])

        const { topic } = requestEvent ? requestEvent : { topic: "" }

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

                //TODO: add to history?

                onClose()
            },
            [account, params, requestURL, topic, web3Wallet, onClose],
        )

        const onTestDelegate = useCallback(
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
                    params.delegateUrl !== undefined &&
                    params.delegateUrl !== ""
                ) {
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

                            await web3Wallet.respondSessionRequest({
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

                switch (method) {
                    case VECHAIN_SIGNING_METHODS.IDENTIFY:
                        await signIdentityCertificate(id, privateKey)
                        break
                    case VECHAIN_SIGNING_METHODS.REQUEST_TRANSACTION:
                        await onTestDelegate(id, privateKey)
                        break
                    default:
                        break
                }
            },
            [
                account,
                requestEvent,
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
            }

            onClose()
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
            <BaseBottomSheet
                enablePanDownToClose={false}
                snapPoints={snapPoints}
                ref={ref}
                onPressOutside={"none"}>
                <BaseView alignItems="center" justifyContent="center">
                    <BaseText typographyFont="subTitleBold">
                        {"Session Request"}
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
            </BaseBottomSheet>
        )
    },
)

const styles = StyleSheet.create({
    dappLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginVertical: 4,
    },
})
