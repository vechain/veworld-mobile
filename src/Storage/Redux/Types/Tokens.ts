import { FungibleToken, TokenWithCompleteInfo } from "~Model"

export interface TokensState {
    custom: FungibleToken[]
    dashboardChartData: { [key: string]: number[][] }
    assetDetailChartData: { [key: string]: number[][] }
    officialTokens: TokenWithCompleteInfo[]
    coinGeckoTokens: TokenInfoResponse[]
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
