// Export all types
export * from "./types"

// Export providers
export { SmartWalletProvider, useSmartWallet } from "./providers/SmartWalletProvider"
export { SmartWalletWithPrivyProvider } from "./providers/SmartWalletWithPrivy"
export type { SmartWalletWithPrivyProps } from "./providers/SmartWalletWithPrivy"

// Export adapters
export { usePrivyAdapter } from "./adapters/usePrivyAdapter"

// Export hooks
export { useSmartAccount } from "./hooks/useSmartAccount"

// Export utilities
export * from "./utils/errors"
export * from "./utils/smartAccountConfig"
