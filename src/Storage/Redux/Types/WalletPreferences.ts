export type WalletPreference = {
    /**
     * The timestamp of the last validator exited.
     */
    lastValidatorExitedAt?: number
}

/**
 * Record of wallet addresses and their preferences grouped by network genesis id.
 * @typedef {Object} WalletPreferencesState
 * @property {Record<string, Record<string, WalletPreference>>} walletPreferences
 */
export type WalletPreferencesState = Record<string, Record<string, WalletPreference>>
