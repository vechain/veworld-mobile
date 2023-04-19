import { Balance } from "~Model/Balance"

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

/**
 * VIP180 - Fungible Token with a balance field also
 * @field `balance` - the balance of tokens
 */
export interface FungibleTokenWithBalance extends FungibleToken {
    balance: Balance
}
