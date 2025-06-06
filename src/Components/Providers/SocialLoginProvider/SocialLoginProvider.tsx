// src/Providers/SocialLoginProvider.tsx
import React, { createContext, useContext, useCallback, useMemo } from "react"
import { PrivyProvider, usePrivy } from "@privy-io/expo"
import { Transaction } from "@vechain/sdk-core"
import { TypedData } from "../../../Model"
import { useEmbeddedWallet } from "./useEmbeddedWallet"
import { useSmartWallet } from "./useSmartWallet"

// Create context for your enhanced functionality
const SocialLoginContext = createContext<{
    accountAddress: string
    signTransaction: (transaction: Transaction, delegateFor?: string) => Promise<Buffer>
    signMessage: (hash: Buffer) => Promise<Buffer>
    signTypedData: (typedData: TypedData) => Promise<string>
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
    const embeddedWallet = useEmbeddedWallet()
    const smartWallet = useSmartWallet({ delegatorUrl: "https://sponsor.vechain.energy/by/1060" })

    // Explicitly define functions that delegate to the hook
    const signTransaction = useCallback(
        async (transaction: Transaction, delegateFor?: string): Promise<Buffer> => {
            return await embeddedWallet.signTransaction(transaction, delegateFor)
        },
        [embeddedWallet],
    )

    const signMessage = useCallback(
        async (hash: Buffer): Promise<Buffer> => {
            return await smartWallet.signMessage(hash)
        },
        [smartWallet],
    )

    const signTypedData = useCallback(
        async (typedData: TypedData): Promise<string> => {
            return await smartWallet.signTypedData(typedData)
        },
        [smartWallet],
    )

    const contextValue = useMemo(
        () => ({
            accountAddress: smartWallet.smartAccountAddress ?? "",
            signTransaction,
            signMessage,
            signTypedData,
        }),
        [signTransaction, signMessage, signTypedData, smartWallet.smartAccountAddress],
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
