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
    CloseModalButton,
    AccountCard,
} from "~Components"
import { HDNode, secp256k1, Transaction } from "thor-devkit"
import {
    selectSelectedNetwork,
    useAppSelector,
    selectDevice,
    selectAccount,
    useAppDispatch,
    selectAccounts,
} from "~Storage/Redux"
import {
    HexUtils,
    CryptoUtils,
    TransactionUtils,
    WalletConnectUtils,
    WalletConnectResponseUtils,
    AddressUtils,
} from "~Utils"
import { useCheckIdentity } from "~Hooks"
import { error } from "~Utils/Logger"
import { AccountWithDevice, DEVICE_TYPE, Wallet } from "~Model"
import { getSdkError } from "@walletconnect/utils"
import { isEmpty, isUndefined } from "lodash"
import { useI18nContext } from "~i18n"
import { sponsorTransaction, sendTransaction } from "~Networking"
import { ScrollView } from "react-native-gesture-handler"

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
    const accounts = useAppSelector(selectAccounts)
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    // Session request values
    const { chainId, method, params, topic } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const message = params.comment || params.txMessage[0].comment

    const setSelectedAccount = (account: AccountWithDevice) => {
        dispatch(selectAccount({ address: account.address }))
    }

    // Get the address used for this session
    // vechain:main:0f6t...98ty63z
    const address = sessionRequest.namespaces.vechain.accounts[0].split(":")[2]

    const selectedAccount: AccountWithDevice | undefined = accounts.find(
        acct => {
            return AddressUtils.compareAddresses(address, acct.address)
        },
    )
    if (!selectedAccount) throw new Error("Account not found")

    setSelectedAccount(selectedAccount)
    const selectedDevice = useAppSelector(state =>
        selectDevice(state, selectedAccount.rootAddress),
    )

    const onSignTransaction = useCallback(
        async (privateKey: Buffer) => {
            const clauses = params.txMessage

            // TODO: calc intrinsic gas
            // const gas = Transaction.intrinsicGas(clauses)

            const transactionBody: Transaction.Body = {
                chainTag: parseInt(thorClient.genesis.id.slice(-2), 16),
                blockRef: thorClient.status.head.id.slice(0, 18),
                expiration: 18,
                clauses: clauses,
                gasPriceCoef: 0,
                gas: 8000000,
                dependsOn: null,
                nonce: HexUtils.generateRandom(8),
            }

            let transaction: Transaction

            if (
                isUndefined(params.delegateUrl) ||
                isEmpty(params.delegateUrl)
            ) {
                //  sign the transaction locally

                transaction = new Transaction(transactionBody)

                const hash = transaction.signingHash()
                const senderSignature = secp256k1.sign(hash, privateKey)
                const signature = Buffer.concat([senderSignature])
                transaction.signature = signature
            } else {
                // ask the delegator to sign the transaction

                transaction = TransactionUtils.toDelegation(transactionBody)
                const rawTransaction = HexUtils.addPrefix(
                    transaction.encode().toString("hex"),
                )

                // request to send for sponsorship/fee delegation
                const sponsorRequest = {
                    origin: selectedAccount.address.toLowerCase(),
                    raw: rawTransaction,
                }

                try {
                    const response = await sponsorTransaction(
                        params.delegateUrl,
                        sponsorRequest,
                    )

                    const urlDelegationSignature = Buffer.from(
                        response.data.signature.substr(2),
                        "hex",
                    )

                    const hash = transaction.signingHash()
                    const senderSignature = secp256k1.sign(hash, privateKey)

                    const delegationSignature = Buffer.concat([
                        senderSignature,
                        urlDelegationSignature,
                    ])

                    transaction.signature = delegationSignature
                } catch (e) {
                    await WalletConnectResponseUtils.sponsorSignRequestFailedResponse(
                        { request: requestEvent, web3Wallet, LL },
                    )

                    onClose()
                    return
                }
            }

            try {
                const id = await sendTransaction(
                    transaction,
                    network.currentUrl,
                )

                await WalletConnectResponseUtils.transactionRequestSuccessResponse(
                    { request: requestEvent, web3Wallet, LL },
                    id,
                    selectedAccount.address,
                )
            } catch (e) {
                await WalletConnectResponseUtils.transactionRequestFailedResponse(
                    { request: requestEvent, web3Wallet, LL },
                )
            }

            onClose()
        },
        [
            selectedAccount,
            network,
            params,
            thorClient,
            web3Wallet,
            onClose,
            LL,
            requestEvent,
        ],
    )

    const onExtractPrivateKey = useCallback(
        async (decryptedWallet: Wallet) => {
            if (!decryptedWallet)
                throw new Error("Mnemonic wallet can't be empty")

            if (decryptedWallet && !decryptedWallet.mnemonic)
                error("Mnemonic wallet can't have an empty mnemonic")

            if (!selectedAccount.index && selectedAccount.index !== 0)
                throw new Error("Account index is empty")

            const hdNode = HDNode.fromMnemonic(decryptedWallet.mnemonic)
            const derivedNode = hdNode.derive(selectedAccount.index)
            const privateKey = derivedNode.privateKey as Buffer

            return privateKey
        },
        [selectedAccount],
    )

    async function onReject() {
        if (requestEvent) {
            const { id } = requestEvent
            try {
                const response = WalletConnectUtils.formatJsonRpcError(
                    id,
                    getSdkError("USER_REJECTED_METHODS").message,
                )

                await web3Wallet?.respondSessionRequest({
                    topic,
                    response,
                })
            } catch (e) {
                showErrorToast(LL.NOTIFICATION_wallet_connect_matching_error())
            }
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

            const privateKey = await onExtractPrivateKey(decryptedWallet)
            await onSignTransaction(privateKey)
        },
        [selectedDevice, onSignTransaction, onExtractPrivateKey],
    )

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed,
        })

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <CloseModalButton onPress={onClose} />
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {"External app request"}
                    </BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitle">
                        {"Send a transaction"}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>
                        {
                            "Your Signature is being requested to send a transaction"
                        }
                    </BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitleBold">
                        {"Account"}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard account={selectedAccount} />

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitleBold">
                        {LL.SEND_DETAILS()}
                    </BaseText>

                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subTitle">{"Origin"}</BaseText>
                    <BaseSpacer height={8} />
                    <BaseText>{sessionRequest.peer.metadata.name}</BaseText>

                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subTitle">{"Chain"}</BaseText>
                    <BaseSpacer height={8} />
                    <BaseText>{chainId.split(":")[1]}</BaseText>

                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subTitle">{"Method"}</BaseText>
                    <BaseSpacer height={8} />
                    <BaseText>{method}</BaseText>

                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subTitle">{"Message"}</BaseText>
                    <BaseSpacer height={8} />
                    <BaseText numberOfLines={2} ellipsizeMode="tail">
                        {message}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={40} />
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
            </ScrollView>

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
        height: "100%",
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
