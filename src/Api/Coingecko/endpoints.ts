import axios from "axios"
import { error } from "~Utils"

export const COINGECKO_URL = process.env.REACT_APP_COINGECKO_URL
const timeout = Number(process.env.REACT_APP_EXCHANGE_CLIENT_AXIOS_TIMEOUT ?? "5000")
const axiosInstance = axios.create({
    timeout,
    baseURL: COINGECKO_URL,
})

export type TokenInfoMarketData = {
    total_supply: number
    max_supply: number
    circulating_supply: number
    last_updated: string
    price_change_percentage_24h: number
    current_price: { [key: string]: number }
    market_cap: { [key: string]: number }
    total_volume: { [key: string]: number }
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
    market_data: TokenInfoMarketData
}

/**
 *  Get the token info for a given coinGeckoId, including market data
 * @param coinGeckoId - The CoinGecko ID of the coin
 * @returns  the token info
 */
export const getTokenInfo = async (coinGeckoId?: string) => {
    try {
        // Just for better react-query support. We'll never reach this point if used via react-query hooks
        if (!coinGeckoId) throw new Error("CoinGecko ID is not defined")
        const response = await axiosInstance.get<TokenInfoResponse>(`/coins/${coinGeckoId}`, {
            params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
                sparkline: false,
            },
        })
        return response.data
    } catch (e) {
        error("getTokenInfo", e)
        throw e
    }
}
export type MarketChartResponse = {
    timestamp: number
    value: number
}[]
/**
 * Get the market chart of a coin for a given number of days and currency
 * @param coinGeckoId - The CoinGecko ID of the coin
 * @param vs_currency - The currency to compare
 * @param days - The number of days to get the market chart for
 * @returns  the market chart array of arrays of [timestamp, price]
 */
export const getMarketChart = async ({
    coinGeckoId,
    vs_currency,
    days,
    interval = "daily",
}: {
    coinGeckoId?: string
    vs_currency: string
    days: number
    interval?: string
}): Promise<MarketChartResponse> => {
    try {
        // Just for better react-query support. We'll never reach this point if used via react-query hooks
        if (!coinGeckoId) throw new Error("CoinGecko ID is not defined")

        interface PriceChangeResponse {
            prices: number[][]
        }

        const pricesResponse = await axiosInstance.get<PriceChangeResponse>(`/coins/${coinGeckoId}/market_chart`, {
            params: {
                days,
                vs_currency,
                interval,
            },
        })

        return pricesResponse.data.prices.map(entry => ({
            timestamp: entry[0],
            value: entry[1],
        }))
    } catch (e) {
        error("getMarketChart", e)
        throw e
    }
}
