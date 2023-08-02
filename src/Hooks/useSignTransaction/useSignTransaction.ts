import { HDNode, secp256k1, Transaction } from "thor-devkit"
import { CryptoUtils, HexUtils, warn } from "~Utils"
import { showErrorToast, showWarningToast } from "~Components"
import {
    selectDevice,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import {
    AccountWithDevice,
    DEVICE_TYPE,
    LedgerAccountWithDevice,
    Wallet,
} from "~Model"
import { DelegationType } from "~Model/Delegation"
import { sponsorTransaction } from "~Networking"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"

type Props = {
    selectedDelegationAccount?: AccountWithDevice
    selectedDelegationOption: DelegationType
    selectedDelegationUrl?: string
    initialRoute?: Routes
    buildTransaction: () => Transaction
}

export enum SignStatus {
    NAVIGATE_TO_LEDGER = "NAVIGATE_TO_LEDGER",
    DELEGATION_FAILURE = "DELEGATION_FAILURE",
}

export type SignTransactionResponse = Transaction | SignStatus

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
    initialRoute = Routes.HOME,
}: Props) => {
    const { LL } = useI18nContext()
    const account = useAppSelector(selectSelectedAccount)
    const senderDevice = useAppSelector(state =>
        selectDevice(state, account.rootAddress),
    )
    const nav = useNavigation()

    const getSignature = async (
        transaction: Transaction,
        wallet: Wallet,
        delegateFor?: string,
        signatureAccount: AccountWithDevice = account,
    ): Promise<Buffer> => {
        if (!wallet.mnemonic)
            throw new Error("Mnemonic wallet can't have an empty mnemonic")

        if (!signatureAccount.index && signatureAccount.index !== 0)
            throw new Error("signatureAccount index is empty")

        const hdNode = HDNode.fromMnemonic(wallet.mnemonic)
        const derivedNode = hdNode.derive(signatureAccount.index)

        const privateKey = derivedNode.privateKey as Buffer
        const hash = transaction.signingHash(delegateFor?.toLowerCase())
        return secp256k1.sign(hash, privateKey)
    }

    const getUrlDelegationSignature = async (
        transaction: Transaction,
    ): Promise<Buffer | SignStatus.DELEGATION_FAILURE> => {
        try {
            if (!selectedDelegationUrl) {
                throw new Error(
                    "Delegation url not found when requesting delegation signature",
                )
            }

            // build hex encoded version of the transaction for signing request
            const rawTransaction = HexUtils.addPrefix(
                transaction.encode().toString("hex"),
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

            return Buffer.from(signature.substr(2), "hex")
        } catch (e) {
            warn("Error getting URL delegator signature", e)
            return SignStatus.DELEGATION_FAILURE
        }
    }

    const getAccountDelegationSignature = async (
        transaction: Transaction,
        password?: string,
    ): Promise<Buffer | SignStatus.DELEGATION_FAILURE> => {
        try {
            const delegationDevice = selectedDelegationAccount?.device
            if (!delegationDevice)
                throw new Error(
                    "Delegation device not found when sending transaction",
                )

            if (delegationDevice.type === DEVICE_TYPE.LEDGER) {
                showWarningToast(
                    LL.HEADS_UP(),
                    LL.LEDGER_DELEGATION_NOT_SUPPORTED(),
                )
                throw new Error("Delegated hardware wallet not supported yet")
            }

            const { decryptedWallet: delegationWallet } =
                await CryptoUtils.decryptWallet(delegationDevice, password)

            return await getSignature(
                transaction,
                delegationWallet,
                account.address,
                selectedDelegationAccount,
            )
        } catch (e) {
            warn("Error getting account delegator signature", e)
            return SignStatus.DELEGATION_FAILURE
        }
    }

    const getDelegationSignature = async (
        transaction: Transaction,
        password?: string,
    ): Promise<Buffer | SignStatus.DELEGATION_FAILURE | undefined> => {
        switch (selectedDelegationOption) {
            case DelegationType.URL:
                return await getUrlDelegationSignature(transaction)
            case DelegationType.ACCOUNT:
                return await getAccountDelegationSignature(
                    transaction,
                    password,
                )
        }
    }

    const navigateToLedger = async (
        transaction: Transaction,
        ledgerAccount: LedgerAccountWithDevice,
        password?: string,
    ) => {
        const delegationSignature = await getDelegationSignature(
            transaction,
            password,
        )

        if (delegationSignature === SignStatus.DELEGATION_FAILURE) {
            showErrorToast(LL.ERROR(), LL.SEND_DELEGATION_ERROR_SIGNATURE())
            return
        }

        nav.navigate(Routes.LEDGER_SIGN_TRANSACTION, {
            accountWithDevice: ledgerAccount,
            transaction,
            initialRoute,
            delegationSignature: delegationSignature?.toString("hex"),
        })
    }

    /**
     * sign transaction with user's wallet
     */
    const signTransaction = async (
        password?: string,
    ): Promise<SignTransactionResponse> => {
        if (!senderDevice) throw new Error("Sender device not found")

        const transaction = buildTransaction()

        if (senderDevice.type === DEVICE_TYPE.LEDGER) {
            await navigateToLedger(
                transaction,
                account as LedgerAccountWithDevice,
                password,
            )
            return SignStatus.NAVIGATE_TO_LEDGER
        }

        //local mnemonic, identity already verified via useCheckIdentity
        if (!senderDevice.wallet) {
            throw new Error("Hardware wallet not supported yet")
        }

        const { decryptedWallet: senderWallet } =
            await CryptoUtils.decryptWallet(senderDevice, password)

        const senderSignature = await getSignature(transaction, senderWallet)
        const delegationResult = await getDelegationSignature(
            transaction,
            password,
        )

        if (delegationResult === SignStatus.DELEGATION_FAILURE)
            return delegationResult

        transaction.signature = delegationResult
            ? Buffer.concat([senderSignature, delegationResult])
            : senderSignature

        return transaction
    }

    return {
        getUrlDelegationSignature,
        getAccountDelegationSignature,
        signTransaction,
        navigateToLedger,
    }
}
