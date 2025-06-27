import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from "react"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { VechainWalletSDKConfig } from "../types/config"
import { SignOptions, BuildOptions, TypedDataPayload } from "../types/transaction"
import { LoginOptions, WalletAdapter } from "../types/wallet"
import { useSmartAccount } from "../hooks/useSmartAccount"
import { buildSmartWalletTransactionClauses } from "../utils/transactionBuilder"
import { WalletError, WalletErrorType } from "../utils/errors"

/**
 * Context interface for the VeChain Wallet Provider
 */
export interface VechainWalletContext {
    // Core wallet info
    address: string
    isAuthenticated: boolean
    isDeployed: boolean

    // Authentication methods
    signMessage: (message: Buffer) => Promise<Buffer>
    signTransaction: (tx: Transaction, options?: SignOptions) => Promise<Buffer>
    signTypedData: (data: TypedDataPayload) => Promise<string>

    // Transaction methods
    buildTransaction: (clauses: TransactionClause[], options?: BuildOptions) => Promise<Transaction>

    // Authentication management
    login: (options: LoginOptions) => Promise<void>
    logout: () => Promise<void>
}

/**
 * Props for the VechainWalletProvider component
 */
export interface VechainWalletProviderProps {
    children: React.ReactNode
    config: VechainWalletSDKConfig
    adapter: WalletAdapter
}

const VechainWalletContext = createContext<VechainWalletContext | null>(null)

export const VechainWalletProvider: React.FC<VechainWalletProviderProps> = ({ children, config, adapter }) => {
    const [address, setAddress] = useState("")
    const [isDeployed, setIsDeployed] = useState(false)

    // Initialize Thor client
    const thor = useMemo(() => ThorClient.at(config.networkConfig.nodeUrl), [config.networkConfig.nodeUrl])

    // Initialize smart account hook
    const smartAccount = useSmartAccount({
        thor,
        networkName: config.networkConfig.networkType,
    })

    const isAuthenticated = adapter.isAuthenticated

    // Update address when authentication state changes
    useEffect(() => {
        const updateAccountInfo = async () => {
            if (isAuthenticated) {
                try {
                    const account = await adapter.getAccount()
                    setAddress(account.address)

                    // Get smart account info to determine deployment status
                    const smartAccountData = await smartAccount.getSmartAccount(account.address)
                    setIsDeployed(smartAccountData.isDeployed)
                } catch (error) {
                    setAddress("")
                    setIsDeployed(false)
                }
            } else {
                setAddress("")
                setIsDeployed(false)
            }
        }

        updateAccountInfo()
    }, [isAuthenticated, adapter, smartAccount])

    const signMessage = useCallback(
        async (message: Buffer): Promise<Buffer> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated")
            }
            return await adapter.signMessage(message)
        },
        [adapter, isAuthenticated],
    )

    const signTransaction = useCallback(
        async (tx: Transaction, _options?: SignOptions): Promise<Buffer> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated")
            }
            return await adapter.signTransaction(tx)
        },
        [adapter, isAuthenticated],
    )

    const signTypedData = useCallback(
        async (data: TypedDataPayload): Promise<string> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated")
            }
            return await adapter.signTypedData(data)
        },
        [adapter, isAuthenticated],
    )

    const buildTransaction = useCallback(
        async (clauses: TransactionClause[], options?: BuildOptions): Promise<Transaction> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated")
            }

            // Get smart account information
            const smartAccountInfo = await smartAccount.getSmartAccount(address)
            const hasV1SmartAccount = await smartAccount.hasV1SmartAccount(address)

            let smartAccountVersion: number | undefined
            if (smartAccountInfo.address) {
                smartAccountVersion = await smartAccount.getSmartAccountVersion(smartAccountInfo.address)
            } else {
                smartAccountVersion = undefined
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
            const finalClauses = await buildSmartWalletTransactionClauses({
                txClauses: clauses,
                smartAccountConfig,
                networkType: config.networkConfig.networkType,
                signTypedDataFn: async (data: TypedDataPayload): Promise<string> => {
                    return await adapter.signTypedData(data)
                },
            })

            // Estimate gas
            const gasResult = await thor.gas.estimateGas(finalClauses, address, {
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
        [address, smartAccount, config.networkConfig.networkType, thor, adapter, isAuthenticated],
    )

    const login = useCallback(
        async (options: LoginOptions): Promise<void> => {
            await adapter.login(options)
        },
        [adapter],
    )

    const logout = useCallback(async (): Promise<void> => {
        await adapter.logout()
        setAddress("")
        setIsDeployed(false)
    }, [adapter])

    const contextValue = useMemo(
        () => ({
            address,
            isAuthenticated,
            isDeployed,
            signMessage,
            signTransaction,
            signTypedData,
            buildTransaction,
            login,
            logout,
        }),
        [
            address,
            isAuthenticated,
            isDeployed,
            signMessage,
            signTransaction,
            signTypedData,
            buildTransaction,
            login,
            logout,
        ],
    )

    return <VechainWalletContext.Provider value={contextValue}>{children}</VechainWalletContext.Provider>
}

export const useVechainWallet = (): VechainWalletContext => {
    const context = useContext(VechainWalletContext)
    if (!context) {
        throw new Error("useVechainWallet must be used within a VechainWalletProvider")
    }
    return context
}
