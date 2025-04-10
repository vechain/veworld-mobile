import { HDNode } from "thor-devkit"
import { HexUtils, warn } from "~Utils"
import { showErrorToast, showWarningToast, WalletEncryptionKeyHelper } from "~Components"
import { selectDevice, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice, TransactionRequest, Wallet } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { ERROR_EVENTS } from "~Constants"
import { Address, Hex, HexUInt, Secp256k1, Transaction } from "@vechain/sdk-core"
import {
    ProviderInternalBaseWallet,
    signerUtils,
    SignTransactionOptions,
    ThorClient,
    VeChainProvider,
} from "@vechain/sdk-network"
import { useCallback, useMemo } from "react"
import { sponsorTransaction } from "~Networking"

type Props = {
    selectedDelegationAccount?: AccountWithDevice
    selectedDelegationOption: DelegationType
    selectedDelegationUrl?: string
    initialRoute?: Routes.NFTS | Routes.HOME
    buildTransaction: () => Transaction
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
    resetDelegation,
}: Props) => {
    const { LL } = useI18nContext()
    const account = useAppSelector(selectSelectedAccount)
    const senderDevice = useAppSelector(state => selectDevice(state, account.rootAddress))
    const network = useAppSelector(selectSelectedNetwork)
    const nav = useNavigation()
    const thorClient = useMemo(() => ThorClient.at(network.currentUrl), [network.currentUrl])

    const getGasPayerPrivateKey = useCallback(
        async (acc: AccountWithDevice, password?: string) => {
            try {
                const delegationDevice = acc?.device
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

                return getPrivateKey(delegationWallet, acc)
            } catch (e) {
                warn(ERROR_EVENTS.SIGN, "Error getting account delegator signature", e)
                return SignStatus.DELEGATION_FAILURE
            }
        },
        [LL],
    )

    const getSignTxOptions = useCallback(
        async (password?: string): Promise<SignTransactionOptions | SignStatus.DELEGATION_FAILURE | undefined> => {
            if (selectedDelegationOption === DelegationType.URL) return { gasPayerServiceUrl: selectedDelegationUrl! }
            if (selectedDelegationOption === DelegationType.ACCOUNT) {
                const result = await getGasPayerPrivateKey(selectedDelegationAccount!, password)
                if (!result || result === SignStatus.DELEGATION_FAILURE) return SignStatus.DELEGATION_FAILURE
                return { gasPayerPrivateKey: HexUtils.addPrefix(result.toString("hex")) }
            }
        },
        [getGasPayerPrivateKey, selectedDelegationAccount, selectedDelegationOption, selectedDelegationUrl],
    )

    const getSigner = async (wallet: Wallet, password?: string) => {
        const privateKey = getPrivateKey(wallet, account)
        const isValidPrivateKey = Secp256k1.isValidPrivateKey(privateKey)

        if (!isValidPrivateKey) throw new Error("Invalid private key")
        const txOptions = await getSignTxOptions(password)
        if (txOptions === SignStatus.DELEGATION_FAILURE) return SignStatus.DELEGATION_FAILURE
        const provider = new VeChainProvider(
            thorClient,
            new ProviderInternalBaseWallet([{ privateKey, address: account.address }], {
                ...(txOptions && { gasPayer: txOptions }),
            }),
            true,
        )
        return await provider.getSigner()
    }

    const getSignature = async (
        transaction: Transaction,
        wallet: Wallet,
        delegateFor: string,
        signatureAccount: AccountWithDevice = account,
    ): Promise<Buffer> => {
        const privateKey = getPrivateKey(wallet, signatureAccount)
        const hash = transaction.getTransactionHash(Address.of(delegateFor)).bytes
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

            // request to send for sponsorship/fee delegation
            const sponsorRequest = {
                origin: account.address.toLowerCase(),
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

            const delegationWallet = await WalletEncryptionKeyHelper.decryptWallet({
                encryptedWallet: delegationDevice.wallet,
                pinCode: password,
            })

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

        const transaction = buildTransaction()

        if (senderDevice.type === DEVICE_TYPE.LEDGER) {
            await navigateToLedger(transaction, account as LedgerAccountWithDevice, password)
            return SignStatus.NAVIGATE_TO_LEDGER
        }

        //local mnemonic, identity already verified via useCheckIdentity
        if (!senderDevice.wallet) {
            throw new Error("Hardware wallet not supported yet")
        }

        const senderWallet = await WalletEncryptionKeyHelper.decryptWallet({
            encryptedWallet: senderDevice.wallet,
            pinCode: password,
        })

        const signer = await getSigner(senderWallet, password)

        if (signer === SignStatus.DELEGATION_FAILURE) return SignStatus.DELEGATION_FAILURE

        const senderAddress = await signer?.getAddress()
        const txBody = signerUtils.transactionBodyToTransactionRequestInput(transaction.body, senderAddress!)
        const rawTx = await signer!.signTransaction(txBody)
        return Transaction.decode(HexUInt.of(rawTx.slice(2)).bytes, true)
    }

    return {
        signTransaction,
        navigateToLedger,
    }
}
