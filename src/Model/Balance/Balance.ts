import { FungibleToken } from "~Model"

/**
 * @field `tokenAddress` - The address of the token
 * @field `balance` - The current balance
 * @field `timeUpdated` - The time the data was updated in seconds
 * @field `tokenName` - The name of the token
 * @field `tokenSymbol` - The symbol of the token
 * @field `tokenDecimals` - The number of decimals the token has
 * @field `isCustomToken` - Whether the token is a custom token
 * @field `isHidden` - Whether the token is hidden
 */
export interface Balance {
    tokenAddress: string
    balance: string
    timeUpdated: string
    tokenName?: string
    tokenSymbol?: string
    tokenDecimals?: number
    isCustomToken?: boolean
    isHidden: boolean
}

export type DenormalizedAccountTokenBalance = Balance & {
    token: FungibleToken
}
