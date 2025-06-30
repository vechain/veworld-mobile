import React from "react"
import { PrivyProvider } from "@privy-io/expo"
import { SmartWalletProvider, SmartWalletProps } from "./SmartWalletProvider"
import { usePrivySmartAccountAdapter } from "../adapters/usePrivySmartAccountAdapter"
import { VechainWalletSDKConfig } from "../types/config"

interface PrivyConfig extends VechainWalletSDKConfig {
    providerConfig: {
        appId: string
        clientId: string
    }
}

export interface SmartWalletWithPrivyProps extends Omit<SmartWalletProps, "adapter"> {
    config: PrivyConfig
}

/**
 * Provider for a Smart Wallet with Privy integration.
 * This wraps the generic SmartWalletProvider and includes a Privy adapter implementation.
 * @param children - The children of the provider.
 * @param config - The configuration for the provider including Privy app credentials.
 */
const SmartWalletWithPrivyImpl: React.FC<SmartWalletWithPrivyProps> = ({ children, config }) => {
    const adapter = usePrivySmartAccountAdapter()

    return (
        <SmartWalletProvider config={config} adapter={adapter}>
            {children}
        </SmartWalletProvider>
    )
}

export const SmartWalletWithPrivyProvider: React.FC<SmartWalletWithPrivyProps> = ({ children, config }) => {
    return (
        <PrivyProvider appId={config.providerConfig.appId} clientId={config.providerConfig.clientId}>
            <SmartWalletWithPrivyImpl config={config}>{children}</SmartWalletWithPrivyImpl>
        </PrivyProvider>
    )
}
