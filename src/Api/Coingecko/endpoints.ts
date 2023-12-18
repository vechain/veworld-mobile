import axios from "axios"
import { VET, VTHO } from "~Constants"
import { CurrencyExchangeRate } from "~Model"
import { error } from "~Utils"

export const COINGECKO_URL = process.env.REACT_APP_COINGECKO_URL
const timeout = Number(
    process.env.REACT_APP_EXCHANGE_CLIENT_AXIOS_TIMEOUT || "5000",
)
const axiosInstance = axios.create({
    timeout,
    baseURL: COINGECKO_URL,
})

export const VET_COINGECKO_ID: string = "vechain"

export const VETHOR_COINGECKO_ID: string = "vethor-token"

export const getCoinGeckoIdBySymbol = {
    [VET.symbol]: VET_COINGECKO_ID,
    [VTHO.symbol]: VETHOR_COINGECKO_ID,
}

export const getCoingeckoCurrencies = async (): Promise<string[]> => {
    try {
        const currencies = await axiosInstance.get<string[]>(
            "/simple/supported_vs_currencies",
        )

        //Sort alphabetically
        return currencies.data.sort((a, b) => a.localeCompare(b))
    } catch (e) {
        error("getCoingeckoCurrencies", e)
        throw e
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

export const getMarketInfo = async ({
    coinGeckoIds,
    vs_currency,
}: {
    coinGeckoIds?: string[]
    vs_currency: string
}) => {
    try {
        const pricesResponse = await axiosInstance.get<MarketInfoResponse[]>(
            "/coins/markets",
            {
                params: {
                    ids: coinGeckoIds,
                    vs_currency,
                    order: "market_cap_desc",
                    per_page: 100,
                    page: 1,
                    sparkline: false,
                    locale: "en",
                },
                paramsSerializer: params => {
                    return Object.entries(params)
                        .map(([key, value]) => `${key}=${value}`)
                        .join("&")
                },
            },
        )

        return pricesResponse.data
    } catch (e) {
        error("getMarketInfo", e)
        throw e
    }
}

interface PriceChangeResponse {
    prices: number[][]
}

export const getExchangeRate = async ({
    coinGeckoId,
    vs_currency,
}: {
    coinGeckoId?: string
    vs_currency: string
}): Promise<CurrencyExchangeRate> => {
    try {
        // Just for better react-query support. We'll never reach this point if used via react-query hooks
        if (!coinGeckoId) throw new Error("CoinGecko ID is not defined")

        const pricesResponse = await axiosInstance.get<PriceChangeResponse>(
            `/coins/${coinGeckoId}/market_chart`,
            {
                params: {
                    days: 1,
                    vs_currency: vs_currency,
                },
            },
        )

        const prices = pricesResponse.data.prices

        //The current exchange rate - the last entry
        const currentExchangeRate = prices[prices.length - 1][1]

        let percentChange

        //First entry is 24 hours ago
        const yesterdaysExchangeRate = prices[0][1]
        //Difference between today and yesterday
        const priceChange = currentExchangeRate - yesterdaysExchangeRate
        //Percent of yesterdays price
        const change = (priceChange / yesterdaysExchangeRate) * 100
        //Rounded to 2 digits
        percentChange = +change.toFixed(2)

        return {
            rate: currentExchangeRate,
            change: percentChange,
            coinGeckoId,
        }
    } catch (e) {
        error("getExchangeRate", e)
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
}: {
    coinGeckoId?: string
    vs_currency: string
    days: number
}): Promise<MarketChartResponse> => {
    try {
        // Just for better react-query support. We'll never reach this point if used via react-query hooks
        if (!coinGeckoId) throw new Error("CoinGecko ID is not defined")

        const pricesResponse = await axiosInstance.get<PriceChangeResponse>(
            `/coins/${coinGeckoId}/market_chart`,
            {
                params: {
                    days,
                    vs_currency,
                },
            },
        )

        return pricesResponse.data.prices.map(entry => ({
            timestamp: entry[0],
            value: entry[1],
        }))
    } catch (e) {
        error("getMarketChart", e)
        throw e
    }
}
