import { FungibleToken, TokenWithCompleteInfo, NETWORK_TYPE } from "~Model"

export type TokensState = {
    tokens: {
        [network in NETWORK_TYPE]: {
            custom: Record<string, FungibleToken[]>
            officialTokens: TokenWithCompleteInfo[]
            suggestedTokens: string[]
        }
    }
}

export type TokenInfoResponse = {
    id: string
    symbol: string
    name: string
    detail_platforms: {
        vechain: {
            decimal_place: number
            contract_address: string
        }
    }
    image: {
        thumb: string
        small: string
        large: string
    }
    description: { [key: string]: string }
    links: {
        blockchain_site: string[]
        homepage: string[]
    }
}
