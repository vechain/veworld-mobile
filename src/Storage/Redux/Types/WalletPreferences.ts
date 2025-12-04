export type WalletPreference = {
    /**
     * The timestamp of the last validator exited.
     */
    lastValidatorExitedAt: number
    /**
     * The id of the last validator exited.
     */
    lastValidatorExitedId: string
}

/**
 * Record of wallet addresses and their preferences grouped by network genesis id.
 * @typedef {Object} WalletPreferencesState
 * @property {Record<string, Record<string, WalletPreference>>} walletPreferences
 */
export type WalletPreferencesState = Record<string, Record<string, WalletPreference>>
