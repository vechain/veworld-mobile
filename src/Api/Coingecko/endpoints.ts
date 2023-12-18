import axios from "axios"
import { VET, VTHO } from "~Constants"
import { CurrencyExchangeRate } from "~Model"
import { TokenUtils, error } from "~Utils"

export const COINGECKO_URL = process.env.REACT_APP_COINGECKO_URL
const timeout = Number(
    process.env.REACT_APP_EXCHANGE_CLIENT_AXIOS_TIMEOUT ?? "5000",
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

type FetchTokensResponse = {
    id: string
    symbol: string
    name: string
    platforms: {
        vechain: string
    }
}

export const getCoingeckoVechainTokenList = async () => {
    try {
        const tokens = await axiosInstance.get<FetchTokensResponse[]>(
            "/coins/list",
            {
                params: {
                    include_platform: true,
                },
            },
        )

        const vechainTokens = tokens.data.filter(c =>
            c.platforms.hasOwnProperty("vechain"),
        )
        //TODO: We're returning only VET and VTHO. All other tokens are disabled
        return vechainTokens.filter(token =>
            TokenUtils.isVechainToken(token.symbol),
        )
    } catch (e) {
        error("getCoingeckoTokenList", e)
        throw e
    }
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

export const getTokenInfo = async (coinGeckoId?: string) => {
    try {
        // Just for better react-query support. We'll never reach this point if used via react-query hooks
        if (!coinGeckoId) throw new Error("CoinGecko ID is not defined")
        const response = await axiosInstance.get<TokenInfoResponse>(
            `/coins/${coinGeckoId}`,
            {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                    sparkline: false,
                },
            },
        )
        return response.data
    } catch (e) {
        error("getTokenInfo", e)
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
