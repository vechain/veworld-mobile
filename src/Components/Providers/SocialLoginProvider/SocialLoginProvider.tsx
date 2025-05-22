// src/Providers/SocialLoginProvider.tsx
import React, { createContext, useContext, useCallback, useMemo } from "react"
import { PrivyProvider, usePrivy, useEmbeddedEthereumWallet } from "@privy-io/expo"
import { Address, Transaction } from "@vechain/sdk-core"
import { HexUtils } from "~Utils"
import { TypedData } from "../../../Model"

// Create context for your enhanced functionality
const SocialLoginContext = createContext<{
    signTransaction: (transaction: Transaction, delegateFor?: string) => Promise<Buffer>
    signMessage: (hash: Buffer) => Promise<Buffer>
    signTypedData: (typedData: TypedData) => Promise<string>
    // Any other functions you want to add
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
    const { wallets } = useEmbeddedEthereumWallet()

    const signTransaction = useCallback(
        async (transaction: Transaction, delegateFor?: string): Promise<Buffer> => {
            const hash = transaction.getTransactionHash(delegateFor ? Address.of(delegateFor) : undefined)

            if (!wallets) throw new Error("No Social wallet found")

            const privyProvider = await wallets[0].getProvider()

            // console.log("Privy hash", hash.toString())
            const response = await privyProvider.request({
                method: "secp256k1_sign",
                params: [hash.toString()],
            })
            // console.log("privy got send signature", response)
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
            console.log("signed TX with Privy", signatureBuffer)
            return signatureBuffer
        },
        [wallets],
    )

    const signMessage = useCallback(
        async (hash: Buffer) => {
            if (!wallets) throw new Error("No Social wallet found")

            const privyProvider = await wallets[0].getProvider()
            const privvyAccount = wallets[0].address

            const signature = await privyProvider.request({
                method: "personal_sign",
                params: [HexUtils.addPrefix(hash.toString("hex")), privvyAccount],
            })
            console.log("signed message with Privy", signature)
            return signature
        },
        [wallets],
    )

    const signTypedData = useCallback(
        async (typedData: TypedData) => {
            const { domain, types, value } = typedData
            if (!wallets) throw new Error("No Social wallet found")

            const privyProvider = await wallets[0].getProvider()
            const privvyAccount = wallets[0].address

            const message = await privyProvider.request({
                method: "eth_signTypedData_v4",
                params: [privvyAccount, { domain, primaryType: "Person", types, message: { ...value } }],
            })
            console.log("signed typed data with Privy", message)
            return message
        },
        [wallets],
    )

    const contextValue = useMemo(
        () => ({
            signTransaction,
            signMessage,
            signTypedData,
        }),
        [signTransaction, signMessage, signTypedData],
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
