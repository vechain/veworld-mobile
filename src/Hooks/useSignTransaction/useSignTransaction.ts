import { useNavigation } from "@react-navigation/native"
import { Address, Hex, Secp256k1, Transaction } from "@vechain/sdk-core"
import { HDNode } from "thor-devkit"
import { showWarningToast, WalletEncryptionKeyHelper } from "~Components"
import { ERROR_EVENTS, VTHO } from "~Constants"
import { useI18nContext } from "~i18n"
import {
    AccountWithDevice,
    DEVICE_TYPE,
    LedgerAccountWithDevice,
    LocalDevice,
    TransactionRequest,
    Wallet,
} from "~Model"
import { DelegationType } from "~Model/Delegation"
import { Routes } from "~Navigation"
import { sponsorTransaction } from "~Networking"
import { useSmartWallet } from "../useSmartWallet"
import { delegateGenericDelegator, delegateGenericDelegatorSmartAccount } from "~Networking/GenericDelegator"
import { selectDevice, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNumberUtils, debug, HexUtils, warn } from "~Utils"
import { validateGenericDelegatorTx, validateGenericDelegatorTxSmartAccount } from "~Utils/GenericDelegatorUtils"

type Props = {
    selectedDelegationAccount?: AccountWithDevice
    selectedDelegationOption: DelegationType
    selectedDelegationUrl?: string
    initialRoute?: Routes.NFTS | Routes.HOME
    buildTransaction: () => Promise<Transaction>
    dappRequest?: TransactionRequest
    selectedDelegationToken: string
    genericDelegatorFee?: BigNumberUtils
    genericDelegatorDepositAccount?: string
}

export enum SignStatus {
    NAVIGATE_TO_LEDGER = "NAVIGATE_TO_LEDGER",
    DELEGATION_FAILURE = "DELEGATION_FAILURE",
}

export type SignTransactionResponse = Transaction | SignStatus

const getPrivateKey = (wallet: Wallet, account: AccountWithDevice) => {
    if (!wallet.mnemonic && !wallet.privateKey) throw new Error("Either mnemonic or privateKey must be provided")
    if (!wallet.mnemonic) return Buffer.from(Hex.of(wallet.privateKey!).bytes)
    const hdNode = HDNode.fromMnemonic(wallet.mnemonic, wallet.derivationPath)
    const derivedNode = hdNode.derive(account.index)
    return derivedNode.privateKey!
}

/**
 * Hooks that expose a function to sign and send a transaction performing updates on success
 * @param buildTransaction the function to build the transaction
 * @param selectedDelegationAccount the account to delegate to
 * @param selectedDelegationOption the delegation option
 * @param selectedDelegationUrl the delegation url
 * @param initialRoute the initial route to navigate to
 */
export const useSignTransaction = ({
    selectedDelegationAccount,
    selectedDelegationOption,
    selectedDelegationUrl,
    buildTransaction,
    dappRequest,
    initialRoute,
    selectedDelegationToken,
    genericDelegatorFee,
    genericDelegatorDepositAccount,
}: Props) => {
    const { LL } = useI18nContext()
    const account = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const senderDevice = useAppSelector(state => selectDevice(state, account.rootAddress))
    const nav = useNavigation()
    const { signTransaction: signTransactionWithSmartWallet, ownerAddress: smartWalletOwnerAddress } = useSmartWallet()

    const getSignature = async (
        transaction: Transaction,
        wallet: Wallet,
        delegateFor?: string,
        signatureAccount: AccountWithDevice = account,
    ): Promise<Buffer> => {
        const privateKey = getPrivateKey(wallet, signatureAccount)
        const hash = transaction.getTransactionHash(delegateFor ? Address.of(delegateFor) : undefined).bytes
        return Buffer.from(Secp256k1.sign(hash, privateKey))
    }

    const getUrlDelegationSignature = async (
        transaction: Transaction,
    ): Promise<Buffer | SignStatus.DELEGATION_FAILURE> => {
        try {
            if (!selectedDelegationUrl) {
                throw new Error("Delegation url not found when requesting delegation signature")
            }

            // build hex encoded version of the transaction for signing request
            const rawTransaction = HexUtils.addPrefix(Buffer.from(transaction.encoded).toString("hex"))

            // If the sender is a smart wallet, the origin is the smart wallet owner address as this is where
            // where the initial transaction will be sent from
            const origin = senderDevice?.type === DEVICE_TYPE.SMART_WALLET ? smartWalletOwnerAddress : account.address

            // request to send for sponsorship/fee delegation
            const sponsorRequest = {
                origin: origin.toLowerCase(),
                raw: rawTransaction,
            }

            const signature = await sponsorTransaction(selectedDelegationUrl, sponsorRequest)

            if (!signature) {
                throw new Error("Error getting delegator signature")
            }

            return Buffer.from(signature.substr(2), "hex")
        } catch (e) {
            warn(ERROR_EVENTS.SIGN, "Error getting URL delegator signature", e)
            return SignStatus.DELEGATION_FAILURE
        }
    }

    const getAccountDelegationSignature = async (
        transaction: Transaction,
        password?: string,
    ): Promise<Buffer | SignStatus.DELEGATION_FAILURE> => {
        try {
            const delegationDevice = selectedDelegationAccount?.device
            if (!delegationDevice) throw new Error("Delegation device not found when sending transaction")

            if (delegationDevice.type === DEVICE_TYPE.LEDGER) {
                showWarningToast({
                    text1: LL.HEADS_UP(),
                    text2: LL.LEDGER_DELEGATION_NOT_SUPPORTED(),
                })
                throw new Error("Delegated hardware wallet not supported yet")
            }
            // If delegating to a smart wallet, sign it from the delegation smart wallet
            if (delegationDevice.type === DEVICE_TYPE.SMART_WALLET) {
                const signature = await signTransactionWithSmartWallet(transaction)
                return Buffer.from(signature.toString("hex"))
            }

            const delegationWallet = await WalletEncryptionKeyHelper.decryptWallet({
                encryptedWallet: delegationDevice.wallet,
                pinCode: password,
            })

            // If the sender is a smart wallet, the delegateForAddress is the smart wallet owner address
            // This is because the intial transaction to the chain will be sent from the smart wallet owner address,
            // not the smart wallet address
            const delegationForAddress =
                senderDevice?.type === DEVICE_TYPE.SMART_WALLET ? smartWalletOwnerAddress : account.address

            return await getSignature(transaction, delegationWallet, delegationForAddress, selectedDelegationAccount)
        } catch (e) {
            warn(ERROR_EVENTS.SIGN, "Error getting account delegator signature", e)
            return SignStatus.DELEGATION_FAILURE
        }
    }

    const getGenericDelegationTransaction = async (transaction: Transaction) => {
        try {
            // build hex encoded version of the transaction for signing request
            const rawTransaction = HexUtils.addPrefix(Buffer.from(transaction.encoded).toString("hex"))

            const origin = senderDevice?.type === DEVICE_TYPE.SMART_WALLET ? smartWalletOwnerAddress : account.address
            // request to send for sponsorship/fee delegation
            const sponsorRequest = {
                origin: origin.toLowerCase(),
                raw: rawTransaction,
            }
            let newTx
            if (senderDevice?.type === DEVICE_TYPE.SMART_WALLET) {
                newTx = await delegateGenericDelegatorSmartAccount({
                    ...sponsorRequest,
                    token: selectedDelegationToken,
                    networkType: selectedNetwork.type,
                })
            } else {
                newTx = await delegateGenericDelegator({
                    ...sponsorRequest,
                    token: selectedDelegationToken,
                    networkType: selectedNetwork.type,
                })
            }

            if (!newTx) {
                throw new Error("[GENERIC DELEGATOR]: Error getting delegator signature")
            }

            return {
                signature: Buffer.from(newTx.signature.substring(2), "hex"),
                transaction: Transaction.of(Transaction.decode(Buffer.from(newTx.raw.substring(2), "hex"), false).body),
            }
        } catch (e) {
            warn(ERROR_EVENTS.SIGN, "Error getting URL delegator signature", e)
            return SignStatus.DELEGATION_FAILURE
        }
    }

    const getDelegationSignature = async (
        transaction: Transaction,
        password?: string,
    ): Promise<{ transaction: Transaction; signature: Buffer | SignStatus.DELEGATION_FAILURE | undefined }> => {
        switch (selectedDelegationOption) {
            case DelegationType.URL: {
                if (selectedDelegationToken === VTHO.symbol || genericDelegatorFee === undefined)
                    return { transaction, signature: await getUrlDelegationSignature(transaction) }
                const result = await getGenericDelegationTransaction(transaction)
                if (result === SignStatus.DELEGATION_FAILURE)
                    return { transaction, signature: SignStatus.DELEGATION_FAILURE }

                if (senderDevice?.type === DEVICE_TYPE.SMART_WALLET) {
                    if (genericDelegatorDepositAccount === undefined) {
                        return { transaction, signature: SignStatus.DELEGATION_FAILURE }
                    }
                    const validationResult = await validateGenericDelegatorTxSmartAccount(
                        result.transaction,
                        selectedDelegationToken,
                        genericDelegatorFee,
                        genericDelegatorDepositAccount,
                    )
                    if (!validationResult.valid) {
                        debug("SIGN", validationResult.reason, validationResult.metadata)
                        return { transaction, signature: SignStatus.DELEGATION_FAILURE }
                    }
                    return { transaction: result.transaction, signature: result.signature }
                }

                const validationResult = await validateGenericDelegatorTx(
                    transaction,
                    result.transaction,
                    selectedDelegationToken,
                    genericDelegatorFee,
                )
                if (!validationResult.valid) {
                    debug("SIGN", validationResult.reason, validationResult.metadata)
                    return { transaction, signature: SignStatus.DELEGATION_FAILURE }
                }
                return { transaction: result.transaction, signature: result.signature }
            }
            case DelegationType.ACCOUNT:
                return { transaction, signature: await getAccountDelegationSignature(transaction, password) }
            default:
                return { transaction, signature: undefined }
        }
    }

    const navigateToLedger = async (
        transaction: Transaction,
        ledgerAccount: LedgerAccountWithDevice,
        password?: string,
    ) => {
        const { signature: delegationSignature, transaction: newTx } = await getDelegationSignature(
            transaction,
            password,
        )

        if (delegationSignature === SignStatus.DELEGATION_FAILURE) {
            return SignStatus.DELEGATION_FAILURE
        }

        nav.navigate(Routes.LEDGER_SIGN_TRANSACTION, {
            accountWithDevice: ledgerAccount,
            transaction: newTx,
            initialRoute,
            delegationSignature: delegationSignature?.toString("hex"),
            dappRequest,
        })
    }

    /**
     * sign transaction with user's wallet
     */
    const signTransaction = async (password?: string): Promise<SignTransactionResponse> => {
        if (!senderDevice) throw new Error("Sender device not found")

        let transaction = await buildTransaction()

        if (senderDevice.type === DEVICE_TYPE.LEDGER) {
            const result = await navigateToLedger(transaction, account as LedgerAccountWithDevice, password)
            if (result === SignStatus.DELEGATION_FAILURE) return result
            return SignStatus.NAVIGATE_TO_LEDGER
        }

        const { signature: delegationSignature, transaction: newTx } = await getDelegationSignature(
            transaction,
            password,
        )

        let senderSignature: Buffer
        if (senderDevice.type === DEVICE_TYPE.SMART_WALLET) {
            console.log("signing transaction with smart wallet")
            senderSignature = await signTransactionWithSmartWallet(transaction)
        } else {
            //local mnemonic, identity already verified via useCheckIdentity
            if (!(senderDevice as LocalDevice).wallet) {
                throw new Error("Hardware wallet not supported yet")
            }

            const senderWallet = await WalletEncryptionKeyHelper.decryptWallet({
                encryptedWallet: (senderDevice as LocalDevice).wallet,
                pinCode: password,
            })

            senderSignature = await getSignature(transaction, senderWallet)
        }

        if (delegationSignature === SignStatus.DELEGATION_FAILURE) return SignStatus.DELEGATION_FAILURE

        return Transaction.of(
            newTx.body,
            delegationSignature ? Buffer.concat([senderSignature, delegationSignature]) : senderSignature,
        )
    }

    return {
        signTransaction,
        navigateToLedger,
    }
}
