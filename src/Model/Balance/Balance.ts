import { FungibleToken } from "~Model"

/**
 * @field `accountAddress` - The account address that has selected this token
 * @field `tokenAddress` - The address of the token
 * @field `balance` - The current balance
 * @field `genesisId` - The ID of the genesis block. Used to identify the network
 * @field `timeUpdated` - The time the data was updated in seconds
 * @field `position` - The position of the token in the account's token list
 */
export interface Balance {
    accountAddress: string
    tokenAddress: string
    balance: string
    genesisId: string
    timeUpdated: string
    position?: number
}

export type DenormalizedAccountTokenBalance = Balance & {
    token: FungibleToken
}
