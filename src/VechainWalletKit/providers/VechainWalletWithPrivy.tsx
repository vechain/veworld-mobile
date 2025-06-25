import React, { useMemo } from "react"
import { PrivyProvider, usePrivy, useEmbeddedEthereumWallet } from "@privy-io/expo"
import { VechainWalletProvider, VechainWalletProviderProps } from "./VechainWalletProvider"
import { PrivyAdapter } from "../adapters/PrivyAdapter"

interface VechainWalletWithPrivyProps extends Omit<VechainWalletProviderProps, "adapter"> {
    // Add any Privy-specific props if needed
}

const VechainWalletWithPrivyImplementation: React.FC<VechainWalletWithPrivyProps> = ({ children, config }) => {
    const { user, logout } = usePrivy()
    const { wallets } = useEmbeddedEthereumWallet()

    const adapter = useMemo(
        () =>
            new PrivyAdapter(
                () => user,
                () => wallets || [],
                () => logout,
            ),
        [user, wallets, logout],
    )

    return (
        <VechainWalletProvider config={config} adapter={adapter}>
            {children}
        </VechainWalletProvider>
    )
}

export const VechainWalletWithPrivy: React.FC<VechainWalletWithPrivyProps> = ({ children, config }) => {
    return (
        <PrivyProvider appId={config.providerConfig.appId} clientId={config.providerConfig.clientId}>
            <VechainWalletWithPrivyImplementation config={config}>{children}</VechainWalletWithPrivyImplementation>
        </PrivyProvider>
    )
}
