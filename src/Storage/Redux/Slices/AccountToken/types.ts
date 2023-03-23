import { FungibleToken } from "~Model"

export type AccountToken = FungibleToken & {
    id: string // this is just used to identify the accountToken and will be `${tokenAddress}-${accountAddress}`
    accountAddress: string
}

export type AccountTokenState = {
    fungible: AccountToken[]
}
