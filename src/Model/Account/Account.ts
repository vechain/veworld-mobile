import { BaseDevice } from "~Model/Device"

/**
 * The model for an Account in the wallet
 * @field `alias` - A name for this account
 * @field `address` - The address of the account
 * @field `rootAddress` - The root address of the wallet device
 * @field `index` - `(optional)` Required for `LOCAL_MNEMONIC` wallets. The index of the wallet
 * @field `path` - `(optional)` Required for `LEDGER` or `TREZOR` wallets. The path of the wallet
 * @field `visible` - Whether the account will be shown on the screens
 */

export interface Account {
    alias: string
    address: string
}
export interface WalletAccount extends Account {
    rootAddress: string
    index: number
    path?: string
    visible: boolean
}

export interface AccountWithDevice extends WalletAccount {
    device: Device
}

/**
 * Used on the account management screens
 * Grouping accounts by their device
 */
export interface GroupedAccounts {
    device: BaseDevice
    accounts: WalletAccount[]
}
