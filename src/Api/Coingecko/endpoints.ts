import axios from "axios"
import { VET, VTHO } from "~Constants"
import { CurrencyExchangeRate } from "~Model"

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
    const currencies = await axiosInstance.get<string[]>(
        "/simple/supported_vs_currencies",
    )

    //Sort alphabetically
    return currencies.data.sort((a, b) => a.localeCompare(b))
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
}
