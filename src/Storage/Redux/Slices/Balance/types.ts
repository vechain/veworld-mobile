import { AccountToken } from "../AccountToken/types"

export interface TokenBalance {
    accountTokenId: string
    balance: string
    timeUpdated: string
}

export type BalanceState = TokenBalance[]

export type AccountTokenBalance = TokenBalance & AccountToken
