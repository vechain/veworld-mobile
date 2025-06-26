// Main provider
export { VechainWalletProvider, useVechainWallet } from "./providers/VechainWalletProvider"

// Privy-specific provider
export { VechainWalletWithPrivy } from "./providers/VechainWalletWithPrivy"

// Functional hooks
export * from "./hooks"

// Types
export * from "./types"
export type { LoginOptions } from "./types/wallet"

// Utils and adapters
export { usePrivyAdapter } from "./adapters/PrivyAdapter"
export * from "./utils/errors"
