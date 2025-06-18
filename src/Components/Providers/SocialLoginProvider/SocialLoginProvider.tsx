// src/Providers/SocialLoginProvider.tsx
import React, { createContext, useContext, useCallback, useMemo } from "react"
import { PrivyProvider, usePrivy } from "@privy-io/expo"
// import { Transaction } from "@vechain/sdk-core"
import { TypedData } from "../../../Model"
// import { useEmbeddedWallet } from "./useEmbeddedWallet"
import { useSmartWallet } from "./useSmartWallet"
import { TransactionClause } from "@vechain/sdk-core"

// Create context for your enhanced functionality
const SocialLoginContext = createContext<{
    accountAddress: string
    signTransaction: (clauses: TransactionClause[], delegateFor?: string) => Promise<string>
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
    // const embeddedWallet = useEmbeddedWallet()
    const smartWallet = useSmartWallet({ delegatorUrl: "https://sponsor.vechain.energy/by/1060" })

    // Explicitly define functions that delegate to the hook
    const sendTransaction = useCallback(
        async (clauses: TransactionClause[], delegateFor?: string): Promise<string> => {
            console.log("SocialLoginProvider signTransaction")
            const id = await smartWallet.sendTransaction({ txClauses: clauses })
            console.log("id", id)
            return id
        },
        [smartWallet],
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
            signTransaction: sendTransaction,
            signMessage,
            signTypedData,
        }),
        [sendTransaction, signMessage, signTypedData, smartWallet.smartAccountAddress],
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
