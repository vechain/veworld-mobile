// /**
//  * The model for an Account in the wallet
//  * @field `id` - The ID of the account - used to create aliases
//  * @field `alias` - A name for this account
//  * @field `address` - The address of the account
//  * @field `rootAddress` - The root address of the wallet device
//  * @field `index` - `(optional)` Required for `LOCAL_MNEMONIC` wallets. The index of the wallet
//  * @field `path` - `(optional)` Required for `LEDGER` or `TREZOR` wallets. The path of the wallet
//  * @field `selected` - Whether the account is selected. Only one account should be selected at a time
//  * @field `visible` - Whether the account will be shown on the screens
//  */
// import { StorageData } from "../StorageData"
// import { Device } from "../Device"

// export interface WalletAccount extends Account {
//     id: number
//     rootAddress: string
//     index: number
//     path?: string
//     visible: boolean
// }

// export interface Account {
//     alias: string
//     address: string
// }

// /**
//  * The model for all accounts in chrome storage
//  * @field `accounts` - An array of accounts in storage
//  * @dielf `currentAccount` - The current selected account
//  */
// export interface AccountStorageData extends StorageData {
//     accounts: WalletAccount[]
//     currentAccount: WalletAccount | undefined
// }

// /**
//  * Used on the account management screens
//  * Grouping accounts by their device
//  */
// export interface GroupedAccounts {
//     device: Device
//     accounts: WalletAccount[]
// }
