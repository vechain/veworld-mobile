import { HDNode, Transaction, secp256k1 } from "thor-devkit"
import { error } from "~Common"
import { CryptoUtils, TransactionUtils } from "~Utils"
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
import { useSendTransaction } from "./useSendTransaction"

type Props = {
    transaction: Transaction.Body
    onTXFinish: () => void
    isDelegated: boolean
    urlDelegationSignature?: Buffer
    selectedDelegationAccount?: AccountWithDevice
    selectedDelegationOption: DelegationType
}

export const useSignTransaction = ({
    transaction,
    onTXFinish,
    isDelegated,
    urlDelegationSignature,
    selectedDelegationAccount,
    selectedDelegationOption,
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
    ) => {
        if (!wallet.mnemonic)
            error("Mnemonic wallet can't have an empty mnemonic")

        if (!account.index && account.index !== 0)
            throw new Error("account index is empty")

        const hdNode = HDNode.fromMnemonic(wallet.mnemonic)
        const derivedNode = hdNode.derive(account.index)

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
                if (!urlDelegationSignature) {
                    throw new Error(
                        "Delegation url not found when sending transaction",
                    )
                }
                return Buffer.concat([senderSignature, urlDelegationSignature])
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
                    return
                }

                const { decryptedWallet: delegationWallet } =
                    await CryptoUtils.decryptWallet(delegationDevice, password)

                const accountDelegationSignature = await getSignature(
                    tx,
                    delegationWallet,
                    account.address,
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
    const signAndSendTransaction = async (password?: string) => {
        try {
            if (!senderDevice) return

            //TODO: support ledger
            if (senderDevice.type === DEVICE_TYPE.LEDGER) {
                showWarningToast("Hardware wallet not supported yet")
                return
            }

            //local mnemonic, identity already verified via useCheckIdentity
            if (!senderDevice.wallet) {
                // TODO: support hardware wallet
                showWarningToast("Hardware wallet not supported yet")
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

            await sendTransactionAndPerformUpdates(tx)
        } catch (e) {
            error("[signTransaction]", e)
            showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
        }

        onTXFinish()
    }

    return { signAndSendTransaction, sendTransactionAndPerformUpdates }
}
