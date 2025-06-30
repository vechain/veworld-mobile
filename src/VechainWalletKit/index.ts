// Export all types
export * from "./types"

// Export providers
export {
    SmartWalletProvider as VechainWalletProvider,
    useSmartWallet as useVechainWallet,
} from "./providers/SmartWalletProvider"
export { SmartWalletWithPrivyProvider } from "./providers/SmartWalletWithPrivy"
export type { SmartWalletWithPrivyProps } from "./providers/SmartWalletWithPrivy"

// Export adapters
export { usePrivySmartAccountAdapter } from "./adapters/usePrivySmartAccountAdapter"

// Export hooks
export { useSmartAccount } from "./hooks/useSmartAccount"

// Export utilities
export * from "./utils/errors"
export * from "./utils/smartAccountConfig"
