import { useEmbeddedEthereumWallet } from "@privy-io/expo"
import { Address, Transaction, TransactionClause } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"

import { useSmartWalletDetails } from "./useSmartWalletDetails"
import { selectChainTag, selectSelectedNetwork, useAppSelector } from "../../../Storage/Redux"
import { selectSelectedAccount } from "~Storage/Redux"
import { error, HexUtils } from "~Utils"
import { ERROR_EVENTS } from "../../../Constants/Enums"
import axios, { AxiosError } from "axios"
import {
    buildSmartWalletTransactionClauses,
    type SmartAccountConfig,
    type NetworkConfig,
} from "../../../Utils/SmartWalletTransactionBuilder"
import { useCallback } from "react"

export const useSmartWallet = () => {
    const { wallets } = useEmbeddedEthereumWallet()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const chainTag = useAppSelector(selectChainTag)
    const thor = ThorClient.at(selectedNetwork.currentUrl)

    const { hasV1SmartAccountQuery, smartAccountVersionQuery, smartAccountQuery, getSmartAccountFactoryAddress } =
        useSmartWalletDetails(wallets[0]?.address ?? "")
    const hasV1SmartAccount = hasV1SmartAccountQuery.data

    const smartAccountVersion = smartAccountVersionQuery.data

    const smartAccountAddress = smartAccountQuery.data?.address

    const smartAccountIsDeployed = smartAccountQuery.data?.isDeployed

    const smartAccountFactoryAddress = getSmartAccountFactoryAddress(selectedNetwork.name).accountFactoryAddress

    /**
     * Sign typed data using the embedded wallet provider for React Native
     */
    const signTypedDataPrivy = async (typedData: any): Promise<string> => {
        if (!wallets.length) {
            throw new Error("No embedded wallet available")
        }

        if (!wallets) throw new Error("No Social wallet found")

        const privyProvider = await wallets[0].getProvider()
        const privvyAccount = wallets[0].address
        const signature = await privyProvider.request({
            method: "eth_signTypedData_v4",
            params: [privvyAccount, typedData],
        })

        return signature
    }

    /**
     * Sign a message using the embedded wallet provider for React Native
     */
    const signMessagePrivy = async (message: Buffer): Promise<Buffer> => {
        if (!wallets.length) {
            throw new Error("No embedded wallet available")
        }

        const privyProvider = await wallets[0].getProvider()
        const privvyAccount = wallets[0].address
        const signature = await privyProvider.request({
            method: "personal_sign",
            params: [HexUtils.addPrefix(message.toString("hex")), privvyAccount],
        })

        return signature
    }

    /**
     * Export wallet functionality for React Native
     */
    const exportWallet = async (): Promise<void> => {
        // In React Native, wallet export might work differently
        // This is a placeholder implementation
        throw new Error("Wallet export not implemented for React Native")
    }

    /**
     * Send a transaction on vechain by asking the privy wallet to sign a typed data content
     * that will allow us the execute the action with his smart account through the executeWithAuthorization
     * function of the smart account.
     *
     * This function will do 3 things:
     * 1) Ask signature to the owner of the smart account (distinguishing between if smart account is v1 or v3)
     * - With v1 we will ask 1 signature request for each clause
     * - With v3 we will ask 1 signature request for the batch execution of all clauses
     * 2) After getting the signatures we rebuild the clauses to be broadcasted to the network
     * - If the smart account is not deployed, we add a clause to deploy it
     * 3) We then estimate the gas fees for the transaction and build the transaction body
     * 4) We sign the transaction with a random transaction user and request the fee delegator to pay the gas fees in the process
     * 5) We broadcast the transaction to the network
     */
    const sendTransaction = async ({
        txClauses = [],
        suggestedMaxGas,
    }: {
        txClauses: TransactionClause[]
        suggestedMaxGas?: number
    }): Promise<string> => {
        // Check if queries are still loading
        if (hasV1SmartAccountQuery.isLoading || smartAccountQuery.isLoading || smartAccountVersionQuery.isLoading) {
            throw new Error("Smart wallet data is still loading")
        }

        if (!smartAccountAddress || !selectedAccount || !selectedAccount.address) {
            throw new Error("Address or embedded wallet is missing")
        }

        if (!wallets) throw new Error("No Social wallet found")

        const privyProvider = await wallets[0].getProvider()
        const embeddedWalletAddress = wallets[0].address

        const CHAIN_ID_FROM_TAG: Record<number, number> = {
            74: 6986, // mainnet
            39: 45351, // testnet
        }

        const chainId = CHAIN_ID_FROM_TAG[chainTag]

        // Build smart account configuration
        const smartAccountConfig: SmartAccountConfig = {
            address: smartAccountAddress,
            version: smartAccountVersion,
            isDeployed: smartAccountIsDeployed ?? false,
            hasV1SmartAccount: hasV1SmartAccount ?? false,
            factoryAddress: smartAccountFactoryAddress,
        }

        // Build network configuration
        const networkConfig: NetworkConfig = {
            chainId,
            chainTag,
        }

        // Build transaction clauses using the extracted utility
        const clauses = await buildSmartWalletTransactionClauses({
            txClauses,
            smartAccountConfig,
            networkConfig,
            signTypedData: signTypedDataPrivy,
            selectedAccountAddress: selectedAccount.address,
        })

        // estimate the gas fees for the transaction
        const gasResult = await thor.gas.estimateGas(clauses, embeddedWalletAddress, {
            gasPadding: 1,
        })

        const parsedGasLimit = Math.max(gasResult.totalGas, suggestedMaxGas ?? 0)

        // build the transaction in VeChain format, with delegation enabled
        // TODO: do delegation properly
        const txBody = await thor.transactions.buildTransactionBody(clauses, parsedGasLimit, {
            isDelegated: false,
        })

        const tx = Transaction.of(txBody)

        const hash = tx.getTransactionHash()

        const response = await privyProvider.request({
            method: "secp256k1_sign",
            params: [hash.toString()],
        })
        // vAdjusted = vAdjusted - 27
        const signatureHex = response.slice(2) // Remove 0x prefix
        const r = signatureHex.slice(0, 64)
        const s = signatureHex.slice(64, 128)
        const v = signatureHex.slice(128, 130)

        // Convert v from Ethereum format (27/28) to raw ECDSA format (0/1)
        let vAdjusted = parseInt(v, 16)
        if (vAdjusted === 27 || vAdjusted === 28) {
            vAdjusted -= 27 // Convert from 27/28 to 0/1
        }

        // Reassemble with the correct v value
        const adjustedSignature = `${r}${s}${vAdjusted.toString(16).padStart(2, "0")}`
        const signatureBuffer = Buffer.from(adjustedSignature, "hex")

        const signedTx = Transaction.of(txBody, Buffer.concat([signatureBuffer]))

        const encodedRawTx = {
            raw: HexUtils.addPrefix(Buffer.from(signedTx.encoded).toString("hex")),
        }

        try {
            const txResponse = await axios.post(`${selectedNetwork.currentUrl}/transactions`, encodedRawTx)
            return txResponse.data.id
        } catch (e) {
            if (e instanceof AxiosError) {
                const axiosError = e as AxiosError

                error(ERROR_EVENTS.SEND, {
                    axiosErros: JSON.stringify(axiosError.toJSON()),
                    data: axiosError.response?.data,
                })
            } else {
                try {
                    error(ERROR_EVENTS.SEND, JSON.stringify(e))
                } catch (_) {
                    error(ERROR_EVENTS.SEND, e)
                }
            }

            throw e
        }
    }

    const signTransaction = useCallback(
        async (transaction: Transaction, delegateFor?: string): Promise<Buffer> => {
            console.log("SmartWallet signTransaction", delegateFor)
            const hash = transaction.getTransactionHash(delegateFor ? Address.of(delegateFor) : undefined)

            if (!wallets) throw new Error("No Social wallet found")

            const privyProvider = await wallets[0].getProvider()

            const response = await privyProvider.request({
                method: "secp256k1_sign",
                params: [hash.toString()],
            })

            const signatureHex = response.slice(2) // Remove 0x prefix
            const r = signatureHex.slice(0, 64)
            const s = signatureHex.slice(64, 128)
            const v = signatureHex.slice(128, 130)

            // Convert v from Ethereum format (27/28) to raw ECDSA format (0/1)
            let vAdjusted = parseInt(v, 16)
            if (vAdjusted === 27 || vAdjusted === 28) {
                vAdjusted -= 27 // Convert from 27/28 to 0/1
            }

            // Reassemble with the correct v value
            const adjustedSignature = `${r}${s}${vAdjusted.toString(16).padStart(2, "0")}`
            const signatureBuffer = Buffer.from(adjustedSignature, "hex")
            console.log("got signature from smart wallet")
            return signatureBuffer
        },
        [wallets],
    )
    /**
     * Sign a message using the VechainKit wallet
     * @param message - The message to sign
     * @returns The signature of the message
     */
    const signMessage = async (message: Buffer): Promise<Buffer> => {
        return await signMessagePrivy(message)
    }

    /**
     * Sign a typed data using the VechainKit wallet
     * @param data - The typed data to sign
     * @returns The signature of the typed data
     */
    const signTypedData = async (data: any): Promise<string> => {
        return await signTypedDataPrivy(data)
    }

    const buildTransaction = async (
        clauses: TransactionClause[],
        suggestedMaxGas?: number,
        isDelegated?: boolean,
        dependsOn?: string,
        gasPriceCoef?: number,
    ): Promise<Transaction> => {
        // Check if queries are still loading
        if (hasV1SmartAccountQuery.isLoading || smartAccountQuery.isLoading || smartAccountVersionQuery.isLoading) {
            throw new Error("Smart wallet data is still loading")
        }

        if (!smartAccountAddress || !selectedAccount || !selectedAccount.address) {
            throw new Error("Address or embedded wallet is missing")
        }

        if (!wallets) throw new Error("No Social wallet found")

        const embeddedWalletAddress = wallets[0].address

        const CHAIN_ID_FROM_TAG: Record<number, number> = {
            74: 6986, // mainnet
            39: 45351, // testnet
        }

        const chainId = CHAIN_ID_FROM_TAG[chainTag]

        // Build smart account configuration
        const smartAccountConfig: SmartAccountConfig = {
            address: smartAccountAddress,
            version: smartAccountVersion,
            isDeployed: smartAccountIsDeployed ?? false,
            hasV1SmartAccount: hasV1SmartAccount ?? false,
            factoryAddress: smartAccountFactoryAddress,
        }

        // Build network configuration
        const networkConfig: NetworkConfig = {
            chainId,
            chainTag,
        }

        // Build transaction clauses using the extracted utility
        const smartAccountClauses = await buildSmartWalletTransactionClauses({
            txClauses: clauses,
            smartAccountConfig,
            networkConfig,
            signTypedData: signTypedDataPrivy,
            selectedAccountAddress: selectedAccount.address,
        })
        // estimate the gas fees for the transaction
        const gasResult = await thor.gas.estimateGas(smartAccountClauses, embeddedWalletAddress, {
            gasPadding: 1,
        })

        const parsedGasLimit = Math.max(gasResult.totalGas, suggestedMaxGas ?? 0)

        // build the transaction in VeChain format, with delegation enabled
        console.log("building transaction with delegation", isDelegated)
        const txBody = await thor.transactions.buildTransactionBody(smartAccountClauses, parsedGasLimit, {
            isDelegated,
            gasPriceCoef,
            dependsOn,
        })
        console.log("built transaction", txBody)
        return Transaction.of(txBody)
    }

    return {
        sendTransaction,
        signMessage,
        signTypedData,
        signTransaction,
        exportWallet,
        buildTransaction,
        smartAccountAddress,
    }
}
