import { useContext } from "react"

import { useFeatureFlags } from "../Components/Providers/FeatureFlagsProvider"
import { SmartWalletFallbackContext } from "../Components/Providers/SmartWalletFallbackProvider"
import type { SmartWalletContext } from "../VechainWalletKit/types/wallet"
import { SmartWalletProviderContext } from "../VechainWalletKit/providers/SmartWalletProvider"

export const useSmartWallet = (): SmartWalletContext => {
    const featureFlags = useFeatureFlags()
    const fallbackCtx = useContext(SmartWalletFallbackContext) as SmartWalletContext | undefined

    // never throws; undefined when provider isn’t mounted
    const vechainCtx = useContext(SmartWalletProviderContext) as SmartWalletContext | undefined

    if (!featureFlags?.smartWalletFeature?.enabled || vechainCtx == null) {
        if (fallbackCtx == null) {
            throw new Error("SmartWallet context is unavailable and fallback context is missing.")
        }
        return fallbackCtx
    }
    return vechainCtx
}
