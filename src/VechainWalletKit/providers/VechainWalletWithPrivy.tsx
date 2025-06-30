import React from "react"
import { PrivyProvider } from "@privy-io/expo"
import { VechainWalletProvider, VechainWalletProviderProps } from "./VechainWalletProvider"
import { usePrivySmartAccountAdapter } from "../adapters/PrivySmartAccountAdapter"
import { VechainWalletSDKConfig } from "../types/config"

interface PrivyConfig extends VechainWalletSDKConfig {
    providerConfig: {
        appId: string
        clientId: string
    }
}

interface VechainWalletWithPrivyProps extends Omit<VechainWalletProviderProps, "adapter"> {
    // Add any Privy-specific props if needed
    config: PrivyConfig
}

const VechainWalletWithPrivyImplementation: React.FC<VechainWalletWithPrivyProps> = ({ children, config }) => {
    const adapter = usePrivySmartAccountAdapter()

    return (
        <VechainWalletProvider config={config} adapter={adapter}>
            {children}
        </VechainWalletProvider>
    )
}

export const VechainWalletWithPrivy: React.FC<VechainWalletWithPrivyProps> = ({ children, config }) => {
    // Type cast for Privy-specific configuration

    return (
        <PrivyProvider appId={config.providerConfig.appId} clientId={config.providerConfig.clientId}>
            <VechainWalletWithPrivyImplementation config={config}>{children}</VechainWalletWithPrivyImplementation>
        </PrivyProvider>
    )
}
