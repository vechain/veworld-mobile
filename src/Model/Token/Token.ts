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
