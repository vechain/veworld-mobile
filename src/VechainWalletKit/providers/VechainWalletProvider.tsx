import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from "react"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { VechainWalletSDKConfig } from "../types/config"
import { SignOptions, BuildOptions, TypedDataPayload } from "../types/transaction"
import { BaseAdapter } from "../adapters/BaseAdapter"
import { useWalletTransaction } from "../hooks/useWalletTransaction"
import { WalletError, WalletErrorType } from "../utils/errors"

interface VechainWalletContext {
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
    logout: () => Promise<void>
}

const VechainWalletContext = createContext<VechainWalletContext | null>(null)

export interface VechainWalletProviderProps {
    children: React.ReactNode
    config: VechainWalletSDKConfig
    adapter: BaseAdapter
}

export const VechainWalletProvider: React.FC<VechainWalletProviderProps> = ({ children, config, adapter }) => {
    const [address, setAddress] = useState("")
    const [isDeployed, setIsDeployed] = useState(false)
    console.log("VechainWalletProvider", config)
    // Initialize Thor client
    console.log("config.networkConfig.nodeUrl", config.networkConfig.nodeUrl)
    const thor = useMemo(() => ThorClient.at(config.networkConfig.nodeUrl), [config.networkConfig.nodeUrl])

    // Initialize wallet transaction hook
    const walletTransaction = useWalletTransaction({
        thor,
        networkName: config.networkConfig.networkType,
        signTypedDataFn: async (data: TypedDataPayload): Promise<string> => {
            return await adapter.signTypedData(data)
        },
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
                    const smartAccountInfo = await walletTransaction.getSmartAccountInfo(account.address)
                    setIsDeployed(smartAccountInfo.isDeployed)
                } catch (error) {
                    // Replace console.warn with proper error handling
                    setAddress("")
                    setIsDeployed(false)
                }
            } else {
                setAddress("")
                setIsDeployed(false)
            }
        }

        updateAccountInfo()
    }, [isAuthenticated, adapter, walletTransaction])

    const signMessage = useCallback(
        async (message: Buffer): Promise<Buffer> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.CONNECTION_FAILED, "User not authenticated")
            }

            return await adapter.signMessage(message)
        },
        [isAuthenticated, adapter],
    )

    const signTransaction = useCallback(
        async (tx: Transaction, _options?: SignOptions): Promise<Buffer> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.CONNECTION_FAILED, "User not authenticated")
            }

            return await adapter.signTransaction(tx)
        },
        [isAuthenticated, adapter],
    )

    const signTypedData = useCallback(
        async (data: TypedDataPayload): Promise<string> => {
            if (!isAuthenticated) {
                throw new WalletError(WalletErrorType.CONNECTION_FAILED, "User not authenticated")
            }

            return await adapter.signTypedData(data)
        },
        [isAuthenticated, adapter],
    )

    const buildTransaction = useCallback(
        async (clauses: TransactionClause[], options?: BuildOptions): Promise<Transaction> => {
            if (!isAuthenticated || !address) {
                throw new WalletError(WalletErrorType.CONNECTION_FAILED, "User not authenticated")
            }

            // Use chainId from config for both chainId and chainTag parameters
            const chainId = config.networkConfig.chainId

            return await walletTransaction.buildTransaction(
                clauses,
                address,
                chainId,
                options?.selectedAccountAddress,
                {
                    gas: options?.gas,
                    isDelegated: options?.isDelegated,
                    dependsOn: options?.dependsOn,
                    gasPriceCoef: options?.gasPriceCoef,
                },
            )
        },
        [isAuthenticated, address, walletTransaction, config.networkConfig.chainId],
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
            logout,
        }),
        [address, isAuthenticated, isDeployed, signMessage, signTransaction, signTypedData, buildTransaction, logout],
    )

    return <VechainWalletContext.Provider value={contextValue}>{children}</VechainWalletContext.Provider>
}

export const useVechainWalletContext = (): VechainWalletContext => {
    const context = useContext(VechainWalletContext)
    if (!context) {
        throw new Error("useVechainWalletContext must be used within a VechainWalletProvider")
    }
    return context
}
