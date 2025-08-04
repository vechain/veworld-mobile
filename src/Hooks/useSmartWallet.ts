import { useContext } from "react"

import { useFeatureFlags } from "../Components/Providers/FeatureFlagsProvider"
import { useSmartWalletFallback } from "../Components/Providers/SmartWalletFallbackProvider"
import type { SmartWalletContext } from "../VechainWalletKit/types/wallet"
import { SmartWalletProviderContext } from "../VechainWalletKit/providers/SmartWalletProvider"

export const useSmartWallet = (): SmartWalletContext => {
    const featureFlags = useFeatureFlags()
    const fallbackCtx = useSmartWalletFallback()

    // never throws; undefined when provider isn’t mounted
    const vechainCtx = useContext(SmartWalletProviderContext) as SmartWalletContext | undefined

    const ff = { ...featureFlags, smartWalletFeature: { enabled: false } }
    return !ff.smartWalletFeature.enabled || !vechainCtx ? fallbackCtx : vechainCtx
}
