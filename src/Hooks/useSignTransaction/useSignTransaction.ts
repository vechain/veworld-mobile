import { HDNode, secp256k1, Transaction } from "thor-devkit"
import { CryptoUtils, error, HexUtils, TransactionUtils } from "~Utils"
import { showErrorToast, showWarningToast } from "~Components"
import {
    selectDevice,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import {
    AccountWithDevice,
    DEVICE_TYPE,
    FungibleTokenWithBalance,
    LedgerAccountWithDevice,
    NonFungibleToken,
    Wallet,
} from "~Model"
import { DelegationType } from "~Model/Delegation"
import { useAnalyticTracking, useSendTransaction } from "~Hooks"
import { sponsorTransaction } from "~Networking"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { useMemo } from "react"
import { AnalyticsEvent, TransactionType } from "~Constants"

type Props = {
    transactionBody: Transaction.Body
    onTXFinish: () => void
    isDelegated: boolean
    urlDelegationSignature?: Buffer
    selectedDelegationAccount?: AccountWithDevice
    selectedDelegationOption: DelegationType
    selectedDelegationUrl?: string
    onError?: (e: unknown) => void
    token?: NonFungibleToken | FungibleTokenWithBalance
    initialRoute?: Routes
    transactionType: string
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
 * @param transactionType transaction type
 * @returns {signAndSendTransaction} the function to sign and send the transaction
 */

export const useSignTransaction = ({
    transactionBody,
    onTXFinish,
    isDelegated,
    selectedDelegationAccount,
    selectedDelegationOption,
    selectedDelegationUrl,
    onError,
    initialRoute = Routes.HOME,
    transactionType,
}: Props) => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const senderDevice = useAppSelector(state =>
        selectDevice(state, account.rootAddress),
    )
    const nav = useNavigation()
    const { sendTransactionAndPerformUpdates } = useSendTransaction(
        network,
        account,
    )

    const transaction = useMemo(
        () => TransactionUtils.fromBody(transactionBody, isDelegated),
        [transactionBody, isDelegated],
    )

    const getSignature = async (
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

    const getUrlDelegationSignature = async (): Promise<Buffer> => {
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
    }

    const getAccountDelegationSignature = async (
        password?: string,
    ): Promise<Buffer> => {
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
            delegationWallet,
            account.address,
            selectedDelegationAccount,
        )
    }

    const getDelegationSignature = async (
        password?: string,
    ): Promise<Buffer | undefined> => {
        switch (selectedDelegationOption) {
            case DelegationType.URL:
                return await getUrlDelegationSignature()
            case DelegationType.ACCOUNT:
                return await getAccountDelegationSignature(password)
            default:
                return
        }
    }

    const navigateToLedger = async (
        ledgerAccount: LedgerAccountWithDevice,
        password?: string,
    ) => {
        const delegationSignature = await getDelegationSignature(password)

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
    const signTransaction = async (password?: string) => {
        if (!senderDevice) throw new Error("Sender device not found")

        if (senderDevice.type === DEVICE_TYPE.LEDGER) {
            return await navigateToLedger(
                account as LedgerAccountWithDevice,
                password,
            )
        }

        //local mnemonic, identity already verified via useCheckIdentity
        if (!senderDevice.wallet) {
            throw new Error("Hardware wallet not supported yet")
        }

        const { decryptedWallet: senderWallet } =
            await CryptoUtils.decryptWallet(senderDevice, password)

        const senderSignature = await getSignature(senderWallet)
        const delegationSignature = await getDelegationSignature(password)

        transaction.signature = delegationSignature
            ? Buffer.concat([senderSignature, delegationSignature])
            : senderSignature

        return transaction
    }

    /**
     * sign transaction with user's wallet, send it to thor and perform updates
     */
    const signAndSendTransaction = async (password?: string) => {
        try {
            const signedTx = await signTransaction(password)

            if (!signedTx) return

            await sendTransactionAndPerformUpdates(signedTx)
            switch (transactionType) {
                case TransactionType.NFT:
                    track(AnalyticsEvent.SEND_NFT_SENT)
                    break
                case TransactionType.FungibleToken:
                    track(AnalyticsEvent.SEND_FUNGIBLE_SENT)
                    break
            }
            onTXFinish()
        } catch (e) {
            error("[signTransaction]", e)
            switch (transactionType) {
                case TransactionType.NFT:
                    track(AnalyticsEvent.SEND_NFT_FAILED_TO_SEND)
                    break
                case TransactionType.FungibleToken:
                    track(AnalyticsEvent.SEND_FUNGIBLE_FAILED_TO_SEND)
                    break
            }

            showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
            onError?.(e)
        }
    }

    return {
        getUrlDelegationSignature,
        signAndSendTransaction,
        sendTransactionAndPerformUpdates,
        signTransaction,
        navigateToLedger,
    }
}
