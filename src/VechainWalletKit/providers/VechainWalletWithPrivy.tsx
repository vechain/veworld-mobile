import React from "react"
import { PrivyProvider } from "@privy-io/expo"
import { VechainWalletProvider, VechainWalletProviderProps } from "./VechainWalletProvider"
import { usePrivyAdapter } from "../adapters/PrivyAdapter"

interface VechainWalletWithPrivyProps extends Omit<VechainWalletProviderProps, "adapter"> {
    // Add any Privy-specific props if needed
}

const VechainWalletWithPrivyImplementation: React.FC<VechainWalletWithPrivyProps> = ({ children, config }) => {
    const adapter = usePrivyAdapter()

    return (
        <VechainWalletProvider config={config} adapter={adapter}>
            {children}
        </VechainWalletProvider>
    )
}

export const VechainWalletWithPrivy: React.FC<VechainWalletWithPrivyProps> = ({ children, config }) => {
    // Type cast for Privy-specific configuration
    const privyConfig = config.providerConfig as { appId: string; clientId: string }

    return (
        <PrivyProvider appId={privyConfig.appId} clientId={privyConfig.clientId}>
            <VechainWalletWithPrivyImplementation config={config}>{children}</VechainWalletWithPrivyImplementation>
        </PrivyProvider>
    )
}
