import React, { createContext, useContext, useMemo } from "react"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { SmartWalletContext, LoginOptions } from "../../VechainWalletKit/types/wallet"
import {
    TransactionOptions,
    SignOptions,
    TypedDataPayload,
    GenericDelegationDetails,
} from "../../VechainWalletKit/types/transaction"
import { WalletError, WalletErrorType } from "../../VechainWalletKit/utils/errors"

export const SmartWalletFallbackContext = createContext<SmartWalletContext | null>(null)

interface SmartWalletFallbackProviderProps {
    children: React.ReactNode
}

/**
 * Fallback provider for SmartWallet functionality when the feature is disabled.
 * Provides the same interface as SmartWalletProvider but with disabled/no-op implementations.
 */
export const SmartWalletFallbackProvider: React.FC<SmartWalletFallbackProviderProps> = ({ children }) => {
    const contextValue = useMemo(
        (): SmartWalletContext => ({
            // Authentication state - always disabled
            isAuthenticated: false,
            isLoading: false,
            isInitialized: false,

            // Addresses - empty when disabled
            ownerAddress: "",
            smartAccountAddress: "",

            // Authentication operations - throw descriptive errors
            login: async (_options: LoginOptions): Promise<void> => {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet functionality is currently disabled. Please enable the smartWalletFeature flag.",
                )
            },

            logout: async (): Promise<void> => {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet functionality is currently disabled. Please enable the smartWalletFeature flag.",
                )
            },

            // Wallet initialization - throw descriptive error
            initialiseWallet: async (): Promise<void> => {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet functionality is currently disabled. Please enable the smartWalletFeature flag.",
                )
            },

            // Signing operations - throw descriptive errors
            signMessage: async (_message: Buffer): Promise<Buffer> => {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet functionality is currently disabled. Please enable the smartWalletFeature flag.",
                )
            },

            signTransaction: async (_tx: Transaction, _options?: SignOptions): Promise<Buffer> => {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet functionality is currently disabled. Please enable the smartWalletFeature flag.",
                )
            },

            signTypedData: async (_data: TypedDataPayload): Promise<string> => {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet functionality is currently disabled. Please enable the smartWalletFeature flag.",
                )
            },

            // Transaction building - throw descriptive error
            buildTransaction: async (
                _clauses: TransactionClause[],
                _options?: TransactionOptions,
                _genericDelgation?: GenericDelegationDetails,
            ): Promise<Transaction> => {
                throw new WalletError(
                    WalletErrorType.WALLET_NOT_FOUND,
                    "Smart wallet functionality is currently disabled. Please enable the smartWalletFeature flag.",
                )
            },
        }),
        [],
    )

    return <SmartWalletFallbackContext.Provider value={contextValue}>{children}</SmartWalletFallbackContext.Provider>
}

/**
 * Hook to use the fallback smart wallet context.
 * This should only be used internally by the ConditionalSmartWallet component.
 * External components should continue using useSmartWallet from ~Hooks.
 */
export const useSmartWalletFallback = (): SmartWalletContext => {
    const context = useContext(SmartWalletFallbackContext)
    if (!context) {
        throw new WalletError(
            WalletErrorType.CONTEXT_NOT_FOUND,
            "useSmartWalletFallback must be used within a SmartWalletFallbackProvider",
        )
    }
    return context
}
