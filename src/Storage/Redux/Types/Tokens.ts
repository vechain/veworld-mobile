import { FungibleToken, TokenWithCompleteInfo, NETWORK_TYPE } from "~Model"

export type TokensState = {
    tokens: {
        [network in NETWORK_TYPE]: {
            custom: Record<string, FungibleToken[]>
            officialTokens: TokenWithCompleteInfo[]
            suggestedTokens: string[]
        }
    }
    dashboardChartData: { [key: string]: number[][] }
    assetDetailChartData: { [key: string]: number[][] }
    coinMarketInfo: { [key: string]: CoinMarketInfo }
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

export interface MarketInfoResponse {
    id: string
    symbol: string
    name: string
    image: string
    current_price: number
    market_cap: number
    market_cap_rank: number
    fully_diluted_valuation: number
    total_volume: number
    high_24h: number
    low_24h: number
    price_change_24h: number
    price_change_percentage_24h: number
    market_cap_change_24h: number
    market_cap_change_percentage_24h: number
    circulating_supply: number
    total_supply: number
    max_supply: number
    ath: number
    ath_change_percentage: number
    ath_date: string
    atl: number
    atl_change_percentage: number
    atl_date: string
    roi: {
        times: number
        currency: string
        percentage: number
    }
    last_updated: string
}

export interface CoinMarketInfo {
    symbol: string
    market_cap: number
    circulating_supply: number
    total_supply: number
    total_volume: number
}
