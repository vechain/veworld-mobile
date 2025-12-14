export type WalletPreference = {
    /**
     * The timestamp of the last validator exited.
     */
    lastValidatorExitedAt?: number
    /**
     * The last token address sent via the send flow
     */
    lastSentTokenAddress?: string
}

/**
 * Record of wallet addresses and their preferences grouped by network genesis id.
 * @typedef {Object} WalletPreferencesState
 * @property {Record<string, Record<string, WalletPreference>>} walletPreferences
 */
export type WalletPreferencesState = Record<string, Record<string, WalletPreference>>
