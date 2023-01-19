// /**
//  * A base object for all tokens
//  * @field `name` - The `name` for this token as defined on the contract
//  * @field `symbol` - The `symbol` for this token as defined on the contract
//  * @field `address` - The `address` of the deployed smart contract
//  * @field `icon` - An image used for display purposes
//  * @field `custom` - A flag to indicate if this token is a custom token
//  */
// import { DIRECTIONS } from "~Common"
// import { StorageData } from "../StorageData"
// import { Balance } from "../Balance"

// export type VeChainToken = "VET" | "VTHO"

// export interface Token {
//     name: string
//     symbol: string
//     address: string
//     icon: string
//     custom: boolean
// }

// /**
//  * VIP180 - Fungible Token
//  * @field `decimal` - The number of `decimal` places as defined on the contract
//  * @field `genesisId` - The ID of the genesis block. Used to identify the network
//  */
// export interface FungibleToken extends Token {
//     decimals: number
//     genesisId: string
// }

// /**
//  * VIP180 - Fungible Token with a balance field also
//  * @field `balance` - the balance of tokens
//  */
// export interface FungibleTokenWithBalance extends FungibleToken {
//     balance: Balance
// }

// export interface TokenCache {
//     fungible: FungibleToken[]
// }

// /**
//  * List of tokens
//  */
// export interface TokenStorageArea extends StorageData {
//     fungible: FungibleToken[]
// }

// // Logs
// export interface TransferLogItem extends TransferLog {
//     direction: DIRECTIONS
//     transactionId: string
// }

// export interface TransferLog {
//     meta: Connex.Thor.Filter.WithMeta["meta"]
//     token: FungibleToken
//     amount: string
//     sender: string
//     recipient: string
//     timestamp: number
// }
