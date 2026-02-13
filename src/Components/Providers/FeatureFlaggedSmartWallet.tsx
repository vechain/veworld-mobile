import React, { useEffect } from "react"
import { SmartWalletWithPrivyProvider, useSmartWallet } from "../../VechainWalletKit"
import { useFeatureFlags } from "./FeatureFlagsProvider"
import { SmartWalletFallbackProvider } from "./SmartWalletFallbackProvider"
import { useAppDispatch } from "~Storage/Redux"
import { updateDeviceLinkedProviders } from "~Storage/Redux/Slices/Device"

/**
 * Headless component that syncs linked OAuth providers from the SmartWallet context to Redux.
 * Runs inside the SmartWalletProvider so it has access to the wallet context.
 * Fault tolerant: if the device doesn't exist in Redux yet (e.g. during onboarding),
 * the reducer is a no-op. On next app open, the wallet re-initialises and this effect
 * re-fires, correcting the state.
 */
const LinkedProviderSync = () => {
    const { isInitialized, smartAccountAddress, linkedAccounts } = useSmartWallet()
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (isInitialized && smartAccountAddress && linkedAccounts.length > 0) {
            const linkedProviders = linkedAccounts.map(acc => acc.type)
            dispatch(
                updateDeviceLinkedProviders({
                    rootAddress: smartAccountAddress,
                    linkedProviders,
                }),
            )
        }
    }, [isInitialized, smartAccountAddress, linkedAccounts, dispatch])

    return null
}

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

    if (featureFlags?.smartWalletFeature?.enabled) {
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
                <LinkedProviderSync />
                {children}
            </SmartWalletWithPrivyProvider>
        )
    }

    return <SmartWalletFallbackProvider>{children}</SmartWalletFallbackProvider>
}
