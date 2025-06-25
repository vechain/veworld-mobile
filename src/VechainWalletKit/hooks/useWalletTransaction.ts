import { useCallback, useMemo } from "react"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { useSmartAccount } from "./useSmartAccount"
import { useTransactionBuilder } from "./useTransactionBuilder"
import { TransactionSigningFunction } from "../types/transactionBuilder"

export interface BuildTransactionOptions {
    gas?: number
    isDelegated?: boolean
    dependsOn?: string
    gasPriceCoef?: number
}

export interface UseWalletTransactionProps {
    thor: ThorClient
    networkName: string
    signTypedDataFn: TransactionSigningFunction
}

export function useWalletTransaction({ thor, networkName, signTypedDataFn }: UseWalletTransactionProps) {
    const smartAccount = useSmartAccount({ thor, networkName })
    const transactionBuilder = useTransactionBuilder({ signTypedDataFn })

    const buildTransaction = useCallback(
        async (
            clauses: TransactionClause[],
            ownerAddress: string,
            chainId: number,
            selectedAccountAddress?: string,
            options?: BuildTransactionOptions,
        ): Promise<Transaction> => {
            // Get smart account information
            const smartAccountInfo = await smartAccount.getSmartAccount(ownerAddress)
            const hasV1SmartAccount = await smartAccount.hasV1SmartAccount(ownerAddress)

            let smartAccountVersion: number | undefined
            if (smartAccountInfo.address) {
                try {
                    smartAccountVersion = await smartAccount.getSmartAccountVersion(smartAccountInfo.address)
                } catch {
                    // If we can't get the version, assume it's not deployed yet
                    smartAccountVersion = undefined
                }
            }

            // Build smart account configuration
            const smartAccountConfig = {
                address: smartAccountInfo.address ?? "",
                version: smartAccountVersion,
                isDeployed: smartAccountInfo.isDeployed,
                hasV1SmartAccount,
                factoryAddress: smartAccount.getFactoryAddress(),
            }

            // Build smart wallet transaction clauses
            const finalClauses = await transactionBuilder.buildSmartWalletTransactionClauses({
                txClauses: clauses,
                smartAccountConfig,
                chainId,
                selectedAccountAddress,
            })

            // Estimate gas
            const gasResult = await thor.gas.estimateGas(finalClauses, ownerAddress, {
                gasPadding: 1,
            })

            const parsedGasLimit = Math.max(gasResult.totalGas, options?.gas ?? 0)

            // Build the transaction in VeChain format
            const txBody = await thor.transactions.buildTransactionBody(finalClauses, parsedGasLimit, {
                isDelegated: options?.isDelegated ?? false,
                dependsOn: options?.dependsOn,
                gasPriceCoef: options?.gasPriceCoef,
            })

            return Transaction.of(txBody)
        },
        [thor, smartAccount, transactionBuilder],
    )

    const getSmartAccountInfo = useCallback(
        async (ownerAddress: string) => {
            const smartAccountData = await smartAccount.getSmartAccount(ownerAddress)
            const hasV1SmartAccount = await smartAccount.hasV1SmartAccount(ownerAddress)

            let version: number | undefined
            if (smartAccountData.address) {
                try {
                    version = await smartAccount.getSmartAccountVersion(smartAccountData.address)
                } catch {
                    version = undefined
                }
            }

            return {
                address: smartAccountData.address,
                isDeployed: smartAccountData.isDeployed,
                hasV1Account: hasV1SmartAccount,
                version,
                factoryAddress: smartAccount.getFactoryAddress(),
            }
        },
        [smartAccount],
    )

    return useMemo(
        () => ({
            buildTransaction,
            getSmartAccountInfo,
        }),
        [buildTransaction, getSmartAccountInfo],
    )
}
