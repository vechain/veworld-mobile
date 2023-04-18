import { CurrencyExchangeRate } from "~Model/Currency"

export type VeChainToken = "VET" | "VTHO"
export interface Token {
    name: string
    symbol: string
    address: string
    icon: string
    custom: boolean
}

export interface FungibleToken extends Token {
    decimals: number
    genesisId: string
}

export interface TokenWithExchangeRate
    extends FungibleToken,
        CurrencyExchangeRate {}
