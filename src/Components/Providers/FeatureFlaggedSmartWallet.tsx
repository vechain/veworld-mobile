import React from "react"
import { SmartWalletWithPrivyProvider } from "../../VechainWalletKit"
import { useFeatureFlags } from "./FeatureFlagsProvider"
import { SmartWalletFallbackProvider } from "./SmartWalletFallbackProvider"

export const FeatureFlaggedSmartWallet = ({
    children,
    nodeUrl,
    networkType,
}: {
    children: React.ReactNode
    nodeUrl: string
    networkType: "mainnet" | "testnet" | "solo"
}) => {
    const featureFlags = useFeatureFlags()

    // if (featureFlags?.smartWalletFeature?.enabled) {
    return (
        <SmartWalletWithPrivyProvider
            config={{
                providerConfig: {
                    appId: process.env.PRIVY_APP_ID || "",
                    clientId: process.env.PRIVY_CLIENT_ID || "",
                },
                networkConfig: {
                    nodeUrl,
                    networkType,
                },
            }}>
            {children}
        </SmartWalletWithPrivyProvider>
    )
    // }

    return <SmartWalletFallbackProvider>{children}</SmartWalletFallbackProvider>
}
