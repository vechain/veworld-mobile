import { BaseDevice, LedgerDevice, LocalDevice } from "~Model/Device"
import { DEVICE_TYPE } from "~Model/Wallet"

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
    vnsName?: string
}

export interface WatchedAccount extends WalletAccount {
    type: DEVICE_TYPE.LOCAL_WATCHED
}

export interface AccountWithDevice extends WalletAccount {
    device: Device
    domain?: string
}

export type Device = LedgerDevice | LocalDevice

export interface LocalAccountWithDevice extends WalletAccount {
    device: LocalDevice
}

export interface LedgerAccountWithDevice extends WalletAccount {
    device: LedgerDevice
}

/**
 * Used on the account management screens
 * Grouping accounts by their device
 */
export interface GroupedAccounts {
    device: BaseDevice
    accounts: WalletAccount[]
}

export type LedgerAccount = {
    address: string
    balance?: Connex.Thor.Account
}
