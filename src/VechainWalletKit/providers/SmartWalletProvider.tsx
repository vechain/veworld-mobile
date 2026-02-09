import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from "react"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { NetworkConfig, VechainWalletSDKConfig } from "../types/config"
import { SignOptions, TransactionOptions, TypedDataPayload, GenericDelegationDetails } from "../types/transaction"
import { LoginOptions, SmartAccountAdapter, SocialProvider } from "../types/wallet"
import { getSmartAccount } from "../utils/smartAccount"
import { WalletError, WalletErrorType } from "../utils/errors"
import { SmartAccountTransactionConfig, SmartWalletContext } from "../types"
import { buildSmartAccountTransaction } from "../utils/transactionBuilder"
import { LinkWithOAuthInput } from "@privy-io/expo"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
export interface SmartWalletProps {
    children: React.ReactNode
    config: VechainWalletSDKConfig
    adapter: SmartAccountAdapter
}

export const SmartWalletProviderContext = createContext<SmartWalletContext | null>(null)

/**
 * This uses the adapter pattern to allow for different implementations of the underlying wallet signing functionality.
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
    const [isInitialised, setIsInitialised] = useState(false)

    const thor = useMemo(() => ThorClient.at(config.networkConfig.nodeUrl), [config.networkConfig.nodeUrl])
    const previousConfigRef = useRef<NetworkConfig | null>(null)

    const initialiseWallet = useCallback(async (): Promise<void> => {
        if (!adapter.isAuthenticated) {
            throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
        }
        try {
            setIsLoading(true)
            const adapterAddress = await adapter.createWallet()
            const factoryAddress = getFactoryAddress(config.networkConfig)
            // Get smart account info to determine deployment status and smart account address
            const smartAccountData = await getSmartAccount(thor, adapterAddress, factoryAddress)
            setOwnerAddress(adapterAddress)
            setSmartAccountConfig(smartAccountData)
            setSmartAccountAddress(smartAccountData.address)
            previousConfigRef.current = config.networkConfig
            // Mark as initialized after first successful call
            setIsInitialised(true)
        } catch (error) {
            throw new WalletError(WalletErrorType.NETWORK_ERROR, "Error initialising wallet", error)
        } finally {
            setIsLoading(false)
        }
    }, [adapter, thor, config.networkConfig])

    useEffect(() => {
        const init = async () => {
            if (adapter.isAuthenticated) {
                await initialiseWallet()
            }
        }
        init()
    }, [adapter.isAuthenticated, initialiseWallet])

    // Auto-update when config changes, NOT immediately after initialiseWallet
    useEffect(() => {
        const updateOnConfigChange = async () => {
            if (
                isInitialised &&
                adapter.isAuthenticated &&
                hasNetworkConfigChanged(previousConfigRef.current, config.networkConfig)
            ) {
                try {
                    setIsLoading(true)
                    const factoryAddress = getFactoryAddress(config.networkConfig)
                    const adapterAddress = adapter.getAccount()
                    // Re-fetch smart account info with new config
                    const smartAccountData = await getSmartAccount(thor, adapterAddress, factoryAddress)

                    setSmartAccountConfig(smartAccountData)
                    setSmartAccountAddress(smartAccountData.address)
                } finally {
                    setIsLoading(false)
                }
            }

            // Update ref with current config
            previousConfigRef.current = config.networkConfig
        }

        updateOnConfigChange()
    }, [config.networkConfig, thor, isInitialised, adapter.isAuthenticated, ownerAddress, adapter])

    useEffect(() => {
        switch (adapter.linkOAuthState.status) {
            case "done":
                Feedback.show({
                    severity: FeedbackSeverity.SUCCESS,
                    type: FeedbackType.ALERT,
                    message: "Account linked!",
                })
                break
            case "error":
                Feedback.show({
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                    message: "Failed to link account",
                })
                break
            default:
                break
        }
    }, [adapter.linkOAuthState])

    // Reset state when authentication changes
    useEffect(() => {
        if (!adapter.isAuthenticated) {
            setOwnerAddress("")
            setSmartAccountAddress("")
            setSmartAccountConfig(null)
            setIsInitialised(false)
            setIsLoading(false)
        }
    }, [adapter.isAuthenticated])

    const signMessage = useCallback(
        async (message: Buffer): Promise<Buffer> => {
            if (!adapter.isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            return await adapter.signMessage(message)
        },
        [adapter],
    )

    const signTransaction = useCallback(
        async (tx: Transaction, _options?: SignOptions): Promise<Buffer> => {
            if (!adapter.isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            return await adapter.signTransaction(tx)
        },
        [adapter],
    )

    const signTypedData = useCallback(
        async (data: TypedDataPayload): Promise<string> => {
            if (!adapter.isAuthenticated) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            return await adapter.signTypedData(data)
        },
        [adapter],
    )

    const buildTransaction = useCallback(
        async (
            clauses: TransactionClause[],
            options?: TransactionOptions,
            genericDelgationDetails?: GenericDelegationDetails,
        ): Promise<Transaction> => {
            if (!adapter.isAuthenticated || !ownerAddress) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            if (!smartAccountConfig) {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet not initialized, call initialiseWallet first",
                )
            }

            try {
                const genesisBlock = await thor.blocks.getGenesisBlock()
                if (!genesisBlock) {
                    throw new WalletError(WalletErrorType.NETWORK_ERROR, "Genesis block not found")
                }

                const finalClauses = await buildSmartAccountTransaction({
                    txClauses: clauses,
                    smartAccountConfig,
                    chainId: genesisBlock.id,
                    signTypedDataFn: signTypedData,
                    genericDelgationDetails,
                    ownerAddress,
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
                    maxFeePerGas: options?.maxFeePerGas,
                    maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
                })

                return Transaction.of(txBody)
            } catch (error) {
                throw new WalletError(WalletErrorType.BUILDING_TRANSACTION_ERROR, "Error building transaction", error)
            }
        },
        [ownerAddress, thor, signTypedData, smartAccountConfig, adapter.isAuthenticated],
    )

    // Gas estimation - pass in standard clauses and this function will do all the necessary
    // transaction wrapping required to send the tx via the smart account contract.
    const estimateGas = useCallback(
        async (clauses: TransactionClause[], genericDelegation?: GenericDelegationDetails): Promise<number> => {
            if (!adapter.isAuthenticated || !ownerAddress) {
                throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated, login first")
            }
            if (!smartAccountConfig) {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet not initialized, call initialiseWallet first",
                )
            }

            try {
                const genesisBlock = await thor.blocks.getGenesisBlock()
                if (!genesisBlock) {
                    throw new WalletError(WalletErrorType.NETWORK_ERROR, "Genesis block not found")
                }

                const finalClauses = await buildSmartAccountTransaction({
                    txClauses: clauses,
                    smartAccountConfig,
                    chainId: genesisBlock.id,
                    signTypedDataFn: signTypedData,
                    genericDelgationDetails: genericDelegation,
                    ownerAddress,
                })

                const gasResult = await thor.gas.estimateGas(finalClauses, ownerAddress, {
                    gasPadding: 1,
                })

                return gasResult.totalGas
            } catch (error) {
                throw new WalletError(WalletErrorType.BUILDING_TRANSACTION_ERROR, "Error estimating gas", error)
            }
        },
        [ownerAddress, thor, signTypedData, smartAccountConfig, adapter.isAuthenticated],
    )

    const login = useCallback(
        async (options: LoginOptions): Promise<void> => {
            if (adapter.isAuthenticated && adapter.linkedAccounts.length > 0) {
                const authenticatedWithSameProvider = adapter.linkedAccounts.some(
                    account => account.type === options.provider,
                )

                if (authenticatedWithSameProvider) {
                    // Already authenticated with the requested provider - nothing to do
                    return
                }

                // Authenticated with a different provider (e.g. Apple session persisted in keychain
                // but user is now requesting Google login) - logout first so the correct OAuth flow runs.
                await adapter.logout()
            }

            await adapter.login(options)
        },
        [adapter],
    )

    const logout = useCallback(async (): Promise<void> => {
        await adapter.logout()
        setOwnerAddress("")
        setSmartAccountAddress("")
        setSmartAccountConfig(null)
        setIsInitialised(false)
    }, [adapter])

    const linkOAuth = useCallback(
        async (provider: SocialProvider, opts?: Omit<LinkWithOAuthInput, "provider" | "redirectUri">) => {
            return await adapter.linkOAuth(provider, { redirectUri: "auth/callback", ...opts })
        },
        [adapter],
    )

    const unlinkOAuth = useCallback(
        async (provider: SocialProvider, subject: string) => {
            return await adapter.unlinkOAuth(provider, subject)
        },
        [adapter],
    )

    const contextValue = useMemo(
        () => ({
            ownerAddress,
            smartAccountAddress,
            smartAccountConfig,
            isLoading,
            isInitialized: isInitialised,
            isAuthenticated: adapter.isAuthenticated,
            linkedAccounts: adapter.linkedAccounts,
            hasMultipleSocials: adapter.hasMultipleSocials,
            linkOAuth,
            unlinkOAuth,
            initialiseWallet,
            signMessage,
            signTransaction,
            signTypedData,
            buildTransaction,
            estimateGas,
            login,
            logout,
        }),
        [
            ownerAddress,
            adapter.isAuthenticated,
            adapter.linkedAccounts,
            smartAccountAddress,
            smartAccountConfig,
            isLoading,
            isInitialised,
            initialiseWallet,
            signMessage,
            signTransaction,
            signTypedData,
            buildTransaction,
            estimateGas,
            login,
            logout,
            adapter.hasMultipleSocials,
            linkOAuth,
            unlinkOAuth,
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

export function getFactoryAddress(networkConfig: NetworkConfig): string {
    if (networkConfig.smartAccountFactoryAddress) {
        return networkConfig.smartAccountFactoryAddress
    }

    const factoryAddresses = {
        testnet: "0x713b908Bcf77f3E00EFEf328E50b657a1A23AeaF",
        mainnet: "0xC06Ad8573022e2BE416CA89DA47E8c592971679A",
    }
    const networkType = networkConfig.networkType
    if (networkType !== "testnet" && networkType !== "mainnet") {
        throw new Error(`Unsupported network: ${networkType}`)
    }

    return factoryAddresses[networkType]
}

const hasNetworkConfigChanged = (previousConfig: NetworkConfig | null, currentConfig: NetworkConfig): boolean => {
    if (!previousConfig) {
        return true
    }
    return (
        previousConfig.networkType !== currentConfig.networkType ||
        previousConfig.nodeUrl !== currentConfig.nodeUrl ||
        previousConfig.smartAccountFactoryAddress !== currentConfig.smartAccountFactoryAddress
    )
}
