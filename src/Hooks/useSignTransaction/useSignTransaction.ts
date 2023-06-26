import { HDNode, Transaction, secp256k1 } from "thor-devkit"
import { CryptoUtils, HexUtils, TransactionUtils, error } from "~Utils"
import { showErrorToast, showWarningToast } from "~Components"
import {
    selectDevice,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, DEVICE_TYPE, Wallet } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { useSendTransaction } from "~Hooks"
import { sponsorTransaction } from "~Networking"

type Props = {
    transaction: Transaction.Body
    onTXFinish: () => void
    isDelegated: boolean
    urlDelegationSignature?: Buffer
    selectedDelegationAccount?: AccountWithDevice
    selectedDelegationOption: DelegationType
    selectedDelegationUrl?: string
    onError?: (e: unknown) => void
}
/**
 * Hooks that expose a function to sign and send a transaction performing updates on success
 * @param transaction the transaction to sign and send
 * @param onTXFinish callback to call when the transaction is finished
 * @param isDelegated whether the transaction is a delegation
 * @param urlDelegationSignature the signature of the delegation url
 * @param selectedDelegationAccount the account to delegate to
 * @param selectedDelegationOption the delegation option
 * @param selectedDelegationUrl the delegation url
 * @param onError on transaction error callback
 * @returns {signAndSendTransaction} the function to sign and send the transaction
 */
export const useSignTransaction = ({
    transaction,
    onTXFinish,
    isDelegated,
    selectedDelegationAccount,
    selectedDelegationOption,
    selectedDelegationUrl,
    onError,
}: Props) => {
    const { LL } = useI18nContext()
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const senderDevice = useAppSelector(state =>
        selectDevice(state, account.rootAddress),
    )

    const { sendTransactionAndPerformUpdates } = useSendTransaction(
        network,
        account,
    )

    const getSignature = async (
        tx: Transaction,
        wallet: Wallet,
        delegateFor?: string,
        signatureAccount: AccountWithDevice = account,
    ) => {
        if (!wallet.mnemonic)
            throw new Error("Mnemonic wallet can't have an empty mnemonic")

        if (!signatureAccount.index && signatureAccount.index !== 0)
            throw new Error("signatureAccount index is empty")

        const hdNode = HDNode.fromMnemonic(wallet.mnemonic)
        const derivedNode = hdNode.derive(signatureAccount.index)

        const privateKey = derivedNode.privateKey as Buffer
        const hash = tx.signingHash(delegateFor?.toLowerCase())
        return secp256k1.sign(hash, privateKey)
    }

    const getDelegationSignature = async (
        tx: Transaction,
        senderSignature: Buffer,
        password?: string,
    ) => {
        switch (selectedDelegationOption) {
            case DelegationType.URL:
                if (!selectedDelegationUrl) {
                    throw new Error(
                        "Delegation url not found when requesting delegation signature",
                    )
                }

                // build hex encoded version of the transaction for signing request
                const rawTransaction = HexUtils.addPrefix(
                    tx.encode().toString("hex"),
                )

                // request to send for sponsorship/fee delegation
                const sponsorRequest = {
                    origin: account.address.toLowerCase(),
                    raw: rawTransaction,
                }

                const signature = await sponsorTransaction(
                    selectedDelegationUrl,
                    sponsorRequest,
                )

                if (!signature) {
                    throw new Error("Error getting delegator signature")
                }

                const delegatorSignature = Buffer.from(
                    signature.substr(2),
                    "hex",
                )

                return Buffer.concat([senderSignature, delegatorSignature])
            case DelegationType.ACCOUNT:
                const delegationDevice = selectedDelegationAccount?.device
                if (!delegationDevice)
                    throw new Error(
                        "Delegation device not found when sending transaction",
                    )

                //TODO: support ledger delegation
                if (delegationDevice.type === DEVICE_TYPE.LEDGER) {
                    showWarningToast(
                        "Delegated hardware wallet not supported yet",
                    )
                    throw new Error(
                        "Delegated hardware wallet not supported yet",
                    )
                }

                const { decryptedWallet: delegationWallet } =
                    await CryptoUtils.decryptWallet(delegationDevice, password)

                const accountDelegationSignature = await getSignature(
                    tx,
                    delegationWallet,
                    account.address,
                    selectedDelegationAccount,
                )
                return Buffer.concat([
                    senderSignature,
                    accountDelegationSignature,
                ])
        }
    }

    /**
     * sign transaction with user's wallet
     */
    const signTransaction = async (password?: string) => {
        if (!senderDevice) throw new Error("Sender device not found")

        //TODO: support ledger
        if (senderDevice.type === DEVICE_TYPE.LEDGER) {
            showWarningToast("Hardware wallet not supported yet")
            throw new Error("Hardware wallet not supported yet")
        }

        //local mnemonic, identity already verified via useCheckIdentity
        if (!senderDevice.wallet) {
            // TODO: support hardware wallet
            showWarningToast("Hardware wallet not supported yet")
            throw new Error("Hardware wallet not supported yet")
        }

        const { decryptedWallet: senderWallet } =
            await CryptoUtils.decryptWallet(senderDevice, password)

        const tx = isDelegated
            ? TransactionUtils.toDelegation(transaction)
            : new Transaction(transaction)

        const senderSignature = await getSignature(tx, senderWallet)

        tx.signature = isDelegated
            ? await getDelegationSignature(tx, senderSignature, password)
            : senderSignature

        return tx
    }

    /**
     * sign transaction with user's wallet, send it to thor and perform updates
     */
    const signAndSendTransaction = async (password?: string) => {
        try {
            const tx = await signTransaction(password)

            await sendTransactionAndPerformUpdates(tx)
        } catch (e) {
            error("[signTransaction]", e)
            showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
            onError?.(e)
        }

        onTXFinish()
    }

    return {
        signAndSendTransaction,
        sendTransactionAndPerformUpdates,
        signTransaction,
    }
}
