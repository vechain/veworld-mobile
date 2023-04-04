import { FungibleToken } from "~Model"

export interface TokenBalance {
    accountAddress: string
    tokenAddress: string
    balance: string
    timeUpdated: string
    position?: number
}

export type BalanceState = TokenBalance[]

export type DenormalizedAccountTokenBalance = TokenBalance & {
    token: FungibleToken
}
