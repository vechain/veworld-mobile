// src/Providers/SocialLoginProvider.tsx
import React, { createContext, useContext, useCallback, useMemo } from "react"
import { PrivyProvider, usePrivy } from "@privy-io/expo"
import { useSmartWallet } from "./useSmartWallet"
import { Transaction, TransactionClause } from "@vechain/sdk-core"

// Create context for your enhanced functionality
const SocialLoginContext = createContext<{
    accountAddress: string
    signMessage: (hash: Buffer) => Promise<Buffer>
    signTransaction: (transaction: Transaction, delegateFor?: string) => Promise<Buffer>
    signTypedData: (
        domain: Record<string, unknown>,
        types: Record<string, unknown>,
        message: Record<string, unknown>,
    ) => Promise<string>
    buildTransaction: (
        clauses: TransactionClause[],
        gas?: number,
        isDelegated?: boolean,
        dependsOn?: string,
        gasPriceCoef?: number,
    ) => Promise<Transaction>
} | null>(null)

export const SocialLoginProvider: React.FC<{
    children: React.ReactNode
    appId: string
    clientId: string
}> = ({ children, appId, clientId, ...otherPrivyProps }) => {
    return (
        <PrivyProvider appId={appId} clientId={clientId} {...otherPrivyProps}>
            <SocialLoginImplementation>{children}</SocialLoginImplementation>
        </PrivyProvider>
    )
}

// Inner component that uses Privy hooks after PrivyProvider is initialized
const SocialLoginImplementation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // const embeddedWallet = useEmbeddedWallet()
    const smartWallet = useSmartWallet()

    const signMessage = useCallback(
        async (hash: Buffer): Promise<Buffer> => {
            return await smartWallet.signMessage(hash)
        },
        [smartWallet],
    )

    const signTypedData = useCallback(
        async (
            domain: Record<string, unknown>,
            types: Record<string, unknown>,
            value: Record<string, unknown>,
        ): Promise<string> => {
            return await smartWallet.signTypedData(domain, types, value)
        },
        [smartWallet],
    )

    const signTransaction = useCallback(
        async (transaction: Transaction, delegateFor?: string): Promise<Buffer> => {
            return await smartWallet.signTransaction(transaction, delegateFor)
        },
        [smartWallet],
    )

    const buildTransaction = useCallback(
        async (
            clauses: TransactionClause[],
            gas?: number,
            isDelegated?: boolean,
            dependsOn?: string,
            gasPriceCoef?: number,
        ): Promise<Transaction> => {
            return await smartWallet.buildTransaction(clauses, gas, isDelegated, dependsOn, gasPriceCoef)
        },
        [smartWallet],
    )

    const contextValue = useMemo(
        () => ({
            accountAddress: smartWallet.smartAccountAddress ?? "",
            signTransaction,
            buildTransaction,
            signMessage,
            signTypedData,
        }),
        [signMessage, signTypedData, buildTransaction, smartWallet.smartAccountAddress, signTransaction],
    )

    return <SocialLoginContext.Provider value={contextValue}>{children}</SocialLoginContext.Provider>
}

// Custom hook that combines original Privy functionality with your enhancements
export const useSocialLogin = () => {
    const privyContext = usePrivy() // Original Privy hook
    const enhancedContext = useContext(SocialLoginContext)

    if (!enhancedContext) {
        throw new Error("useSocialLogin must be used within an SocialLoginProvider")
    }

    return {
        ...privyContext,
        ...enhancedContext,
    }
}
