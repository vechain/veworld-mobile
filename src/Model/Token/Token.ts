import { Balance } from "~Model/Balance"
import { DIRECTIONS } from "~Constants"

export type VeChainToken = "VET" | "VTHO"

/**
 * Token
 * @field `name` - The name of the token
 * @field `symbol` - The symbol of the token
 * @field `address` - The address of the token
 * @field `icon` - The icon of the token
 * @field `custom` - Whether the token is a custom token
 */
export interface Token {
    name: string
    symbol: string
    address: string
    icon: string
    custom: boolean
    desc?: string
}

/**
 * VIP180 - Fungible Token
 * @field `decimals` - The number of `decimal` places as defined on the contract
 * @field `genesisId` - The ID of the genesis block. Used to identify the network
 */
export interface FungibleToken extends Token {
    decimals: number
    genesisId: string
}

export interface TokenWithCompleteInfo extends FungibleToken {
    coinGeckoId?: string
    rate?: number
    change?: number
    desc?: string
    balance?: Balance
    links?: {
        blockchain_site: string[]
        homepage: string[]
    }
}

/**
 * VIP180 - Fungible Token with a balance field also
 * @field `balance` - the balance of tokens
 */
export interface FungibleTokenWithBalance extends FungibleToken {
    balance: Balance
}

//Logs

/**
 * VIP180 - Fungible Token Transfer Log
 * @field `meta` - The meta data of the transaction
 * @field `token` - The token that was transferred
 * @field `amount` - The amount of tokens that were transferred
 * @field `sender` - The sender of the tokens
 * @field `recipient` - The recipient of the tokens
 * @field `timestamp` - The timestamp of the transaction
 * @field `index` - The index of the transaction
 * @field `direction` - The direction of the transaction
 * @field `transactionId` - The transaction ID of the transaction
 */
export interface TransferLog {
    meta: Connex.Thor.Filter.WithMeta["meta"]
    token: FungibleToken
    amount: string
    sender: string
    recipient: string
    timestamp: number
    index: number
    direction: DIRECTIONS
    transactionId: string
}
