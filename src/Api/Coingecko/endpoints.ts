import axios from "axios"
import { VET, VTHO } from "~Constants"
import { error } from "~Utils"

export const COINGECKO_URL = process.env.REACT_APP_COINGECKO_URL
const timeout = Number(process.env.REACT_APP_EXCHANGE_CLIENT_AXIOS_TIMEOUT ?? "5000")
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

        interface PriceChangeResponse {
            prices: number[][]
        }

        const pricesResponse = await axiosInstance.get<PriceChangeResponse>(`/coins/${coinGeckoId}/market_chart`, {
            params: {
                days,
                vs_currency,
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
