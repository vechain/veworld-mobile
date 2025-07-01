import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from "react"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { VechainWalletSDKConfig } from "../types/config"
import { SignOptions, TransactionOptions, TypedDataPayload } from "../types/transaction"
import { LoginOptions, SmartAccountAdapter } from "../types/wallet"
import { getSmartAccount } from "../utils/smartAccount"
import { WalletError, WalletErrorType } from "../utils/errors"
import { SmartAccountTransactionConfig, SmartWalletContext } from "../types"
import { buildSmartAccountTransaction } from "../utils/transactionBuilder"
import { getChainId } from "../utils/chainId"

export interface SmartWalletProps {
    children: React.ReactNode
    config: VechainWalletSDKConfig
    adapter: SmartAccountAdapter
}

const SmartWalletProviderContext = createContext<SmartWalletContext | null>(null)

/**
 * Base provider for a smart wallet. This uses the adapter pattern to allow for different implementations of the smart account adapter.
 *
 * @param children - The children of the provider.
 * @param config - The configuration for the provider
 * @param adapter - The adapter that implements the SmartAccountAdapter interface and provides the funtionality to sign, build, and manage the smart account.
 */
export const SmartWalletProvider: React.FC<SmartWalletProps> = ({ children, config, adapter }) => {
    const [ownerAddress, setOwnerAddress] = useState("")
    const [smartAccountAddress, setSmartAccountAddress] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [smartAccountConfig, setSmartAccountConfig] = useState<SmartAccountTransactionConfig | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const thor = useMemo(() => ThorClient.at(config.networkConfig.nodeUrl), [config.networkConfig.nodeUrl])

    const initialiseWallet = useCallback(async (): Promise<void> => {
        if (!adapter.isAuthenticated) {
            throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
        }
        setIsAuthenticated(true)
        try {
            setIsLoading(true)
            const adapterAddress = await adapter.createWallet()
            setOwnerAddress(adapterAddress)
            // Get smart account info to determine deployment status and smart account address
            const smartAccountData = await getSmartAccount(thor, config.networkConfig.networkType, adapterAddress)
            setSmartAccountConfig(smartAccountData)
            setSmartAccountAddress(smartAccountData.address)

            // Mark as initialized after first successful call
            setIsInitialized(true)
        } catch (error) {
            throw new WalletError(WalletErrorType.NETWORK_ERROR, "Error initialising wallet", error)
        } finally {
            setIsLoading(false)
        }
    }, [adapter, thor, config.networkConfig.networkType])

    // Auto-update when config changes, but only if already initialized
    useEffect(() => {
        const updateOnConfigChange = async () => {
            if (isInitialized && isAuthenticated && ownerAddress) {
                try {
                    setIsLoading(true)
                    // Re-fetch smart account info with new config
                    const smartAccountData = await getSmartAccount(thor, config.networkConfig.networkType, ownerAddress)
                    setSmartAccountConfig(smartAccountData)
                    setSmartAccountAddress(smartAccountData.address)
                } catch (error) {
                    // Silently handle config update errors to avoid disrupting user experience
                } finally {
                    setIsLoading(false)
                }
            }
        }

        updateOnConfigChange()
    }, [
        config.networkConfig.networkType,
        config.networkConfig.nodeUrl,
        thor,
        isInitialized,
        isAuthenticated,
        ownerAddress,
    ])

    // Reset state when authentication changes
    useEffect(() => {
        if (!isAuthenticated) {
            setOwnerAddress("")
            setSmartAccountAddress("")
            setSmartAccountConfig(null)
            setIsInitialized(false)
            setIsLoading(false)
        }
    }, [isAuthenticated])

    const signMessage = useCallback(
        async (message: Buffer): Promise<Buffer> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            return await adapter.signMessage(message)
        },
        [adapter, isAuthenticated],
    )

    const signTransaction = useCallback(
        async (tx: Transaction, _options?: SignOptions): Promise<Buffer> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            return await adapter.signTransaction(tx)
        },
        [adapter, isAuthenticated],
    )

    const signTypedData = useCallback(
        async (data: TypedDataPayload): Promise<string> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            return await adapter.signTypedData(data)
        },
        [adapter, isAuthenticated],
    )

    const buildTransaction = useCallback(
        async (clauses: TransactionClause[], options?: TransactionOptions): Promise<Transaction> => {
            if (!isAuthenticated || !ownerAddress) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            if (!smartAccountConfig) {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet not initialized, call initialiseWallet first",
                )
            }

            try {
                const finalClauses = await buildSmartAccountTransaction({
                    txClauses: clauses,
                    smartAccountConfig,
                    chainId: getChainId(config.networkConfig.networkType, config.networkConfig.chainId),
                    signTypedDataFn: signTypedData,
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
            } catch (error) {
                throw new WalletError(WalletErrorType.NETWORK_ERROR, "Error building transaction", error)
            }
        },
        [
            ownerAddress,
            config.networkConfig.networkType,
            thor,
            isAuthenticated,
            signTypedData,
            smartAccountConfig,
            config.networkConfig.chainId,
        ],
    )

    const login = useCallback(
        async (options: LoginOptions): Promise<void> => {
            await adapter.login(options)
        },
        [adapter],
    )

    const logout = useCallback(async (): Promise<void> => {
        await adapter.logout()
        setOwnerAddress("")
        setSmartAccountAddress("")
        setSmartAccountConfig(null)
        setIsInitialized(false)
        setIsAuthenticated(false)
    }, [adapter])

    const contextValue = useMemo(
        () => ({
            ownerAddress,
            smartAccountAddress,
            isLoading,
            isInitialized,
            isAuthenticated,
            initialiseWallet,
            signMessage,
            signTransaction,
            signTypedData,
            buildTransaction,
            login,
            logout,
        }),
        [
            ownerAddress,
            isAuthenticated,
            smartAccountAddress,
            isLoading,
            isInitialized,
            initialiseWallet,
            signMessage,
            signTransaction,
            signTypedData,
            buildTransaction,
            login,
            logout,
        ],
    )

    return <SmartWalletProviderContext.Provider value={contextValue}>{children}</SmartWalletProviderContext.Provider>
}

export const useSmartWallet = (): SmartWalletContext => {
    const context = useContext(SmartWalletProviderContext)
    if (!context) {
        throw new WalletError(
            WalletErrorType.CONTEXT_NOT_FOUND,
            "useSmartWallet must be used within a SmartWalletProvider",
        )
    }
    return context
}
