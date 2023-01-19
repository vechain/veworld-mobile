// import { WALLET_STATUS } from "./enum"
// import { StorageData } from "../StorageData"

// /**
//  * The wallet object that is stored in browser storage. This is the most sensitive piece of data that we store
//  * @field `mnemonic` - `Optional` - The seed mnemonic for a local wallet. This is accessed when signing transactions
//  * @field `privateKey` - `Optional` - The private key for a local wallet. This is accessed when signing transactions
//  * @field `rootAddress` - The address of the first account in this wallet
//  * @field `nonce` - A random string to provide extra entropy
//  */
// export interface Wallet {
//     mnemonic?: string[]
//     privateKey?: string
//     rootAddress: string
//     nonce: string
// }

// /**
//  * Stores the current status of the VeWorld wallet
//  * @field `status` - The current status of the wallet
//  */
// export interface WalletAccess {
//     status: WALLET_STATUS
// }

// /**
//  * The model for all wallets in chrome storage
//  * @field `wallets` - An array of wallets in storage
//  */
// export interface WalletStorageData extends StorageData {
//     wallets: Wallet[]
// }
