/**
 * A model for temporarily storing a backup of the persisted wallet state
 * Each field represents are store and the value is the raw encrypted value that is stored in that store.
 * This object can be used to restore the wallet in the event that something goes wrong when performing an action in the wallet
 */
export interface Backup {
    accounts: string | undefined
    activities: string | undefined
    tokens: string | undefined
    connectedApps: string | undefined
    balances: string | undefined
    settings: string | undefined
    wallet: string | undefined
    devices: string | undefined
    encryptionKey: string | undefined
}
