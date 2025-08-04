// Export all types
export * from "./types"

// Export providers
export { SmartWalletProvider } from "./providers/SmartWalletProvider"
// Note: useSmartWallet is now exported from ~Hooks for feature flag compatibility
export { SmartWalletWithPrivyProvider } from "./providers/SmartWalletWithPrivy"
export type { SmartWalletWithPrivyProps } from "./providers/SmartWalletWithPrivy"

// Export adapters
export { usePrivyExpoAdapter } from "./adapters/usePrivyExpoAdapter"

export * from "./utils/errors"
