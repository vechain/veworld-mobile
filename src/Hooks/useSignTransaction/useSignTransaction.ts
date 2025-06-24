import { useNavigation } from "@react-navigation/native"
import { Address, Hex, Secp256k1, Transaction } from "@vechain/sdk-core"
import { HDNode } from "thor-devkit"
import { showErrorToast, showWarningToast, WalletEncryptionKeyHelper } from "~Components"
import { useSocialLogin } from "../../Components/Providers/SocialLoginProvider/SocialLoginProvider"
import { ERROR_EVENTS } from "~Constants"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice, TransactionRequest, Wallet } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { Routes } from "~Navigation"
import { sponsorTransaction } from "~Networking"
import { selectDevice, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { HexUtils, warn } from "~Utils"
import { useEmbeddedEthereumWallet } from "@privy-io/expo"

type Props = {
    selectedDelegationAccount?: AccountWithDevice
    selectedDelegationOption: DelegationType
    selectedDelegationUrl?: string
    initialRoute?: Routes.NFTS | Routes.HOME
    buildTransaction: () => Promise<Transaction>
    dappRequest?: TransactionRequest
    resetDelegation: () => void
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
 * @param selectedDelegationUrl the delegation url22
 * @param initialRoute the initial route to navigate to
 */
export const useSignTransaction = ({
    selectedDelegationAccount,
    selectedDelegationOption,
    selectedDelegationUrl,
    buildTransaction,
    dappRequest,
    initialRoute,
    resetDelegation,
}: Props) => {
    const { LL } = useI18nContext()
    const account = useAppSelector(selectSelectedAccount)
    const senderDevice = useAppSelector(state => selectDevice(state, account.rootAddress))
    const nav = useNavigation()
    const { wallets } = useEmbeddedEthereumWallet()
    const { signTransaction: socialSignTransaction } = useSocialLogin()
    const getSignature = async (
        transaction: Transaction,
        wallet: Wallet,
        delegateFor?: string,
        signatureAccount: AccountWithDevice = account,
    ): Promise<Buffer> => {
        const privateKey = getPrivateKey(wallet, signatureAccount)
        const hash = transaction.getTransactionHash(delegateFor ? Address.of(delegateFor) : undefined)
        const signature = Buffer.from(Secp256k1.sign(hash.bytes, privateKey))

        return signature
    }

    const getUrlDelegationSignature = async (
        transaction: Transaction,
    ): Promise<Buffer | SignStatus.DELEGATION_FAILURE> => {
        try {
            console.log("getUrlDelegationSignature", transaction)
            if (!selectedDelegationUrl) {
                throw new Error("Delegation url not found when requesting delegation signature")
            }

            // build hex encoded version of the transaction for signing request
            const rawTransaction = HexUtils.addPrefix(Buffer.from(transaction.encoded).toString("hex"))

            let origin = account.address
            if (senderDevice?.type === DEVICE_TYPE.SOCIAL) {
                origin = wallets[0]?.address ?? account.address
            }
            console.log("origin", origin)

            // request to send for sponsorship/fee delegation
            const sponsorRequest = {
                origin: origin.toLowerCase(),
                raw: rawTransaction,
            }
            console.log("sponsorRequest", sponsorRequest, selectedDelegationUrl)
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

            const delegationWallet = await WalletEncryptionKeyHelper.decryptWallet({
                encryptedWallet: delegationDevice.wallet,
                pinCode: password,
            })

            if (senderDevice?.type === DEVICE_TYPE.SOCIAL) {
                console.log("delegationDevice.type === DEVICE_TYPE.SOCIAL", wallets[0]?.address)
                return await getSignature(transaction, delegationWallet, wallets[0]?.address, selectedDelegationAccount)
            }
            return await getSignature(transaction, delegationWallet, account.address, selectedDelegationAccount)
        } catch (e) {
            warn(ERROR_EVENTS.SIGN, "Error getting account delegator signature", e)
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
                return await getAccountDelegationSignature(transaction, password)
        }
    }

    const navigateToLedger = async (
        transaction: Transaction,
        ledgerAccount: LedgerAccountWithDevice,
        password?: string,
    ) => {
        const delegationSignature = await getDelegationSignature(transaction, password)

        if (delegationSignature === SignStatus.DELEGATION_FAILURE) {
            resetDelegation()
            showErrorToast({
                text1: LL.ERROR(),
                text2: LL.SEND_DELEGATION_ERROR_SIGNATURE(),
            })
            return
        }

        nav.navigate(Routes.LEDGER_SIGN_TRANSACTION, {
            accountWithDevice: ledgerAccount,
            transaction,
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

        const transaction = await buildTransaction()

        if (senderDevice.type === DEVICE_TYPE.LEDGER) {
            await navigateToLedger(transaction, account as LedgerAccountWithDevice, password)
            return SignStatus.NAVIGATE_TO_LEDGER
        }

        //local mnemonic, identity already verified via useCheckIdentity
        if (senderDevice.type !== DEVICE_TYPE.SOCIAL && !senderDevice.wallet) {
            throw new Error("Hardware wallet not supported yet")
        }

        let senderSignature: Buffer
        // const senderSignature = await getSignature(transaction, senderWallet)
        if (senderDevice.type === DEVICE_TYPE.SOCIAL) {
            console.log("social sign transaction", transaction)
            senderSignature = await socialSignTransaction(transaction)
        } else {
            const senderWallet = await WalletEncryptionKeyHelper.decryptWallet({
                encryptedWallet: senderDevice.wallet,
                pinCode: password,
            })
            senderSignature = await getSignature(transaction, senderWallet)
        }

        console.log(
            "getting delegation signature",
            selectedDelegationAccount,
            selectedDelegationOption,
            selectedDelegationUrl,
        )
        const delegationSignature = await getDelegationSignature(transaction, password)
        console.log("got delegation signature", delegationSignature)
        if (delegationSignature === SignStatus.DELEGATION_FAILURE) return SignStatus.DELEGATION_FAILURE

        console.log("combining signature " + senderSignature.toString("hex"), delegationSignature?.toString("hex"))

        return Transaction.of(
            transaction.body,
            delegationSignature ? Buffer.concat([senderSignature, delegationSignature]) : senderSignature,
        )
    }

    return {
        signTransaction,
        navigateToLedger,
    }
}
