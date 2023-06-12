import axios from "axios"
import {
    COINGECKO_MARKET_CHART_ENDPOINT,
    COINGECKO_SUPPORTED_CURRENCIES_ENDPOINT,
    EXCHANGE_CLIENT_AXIOS_OPTS,
    CURRENCY,
} from "~Constants"
import { CurrencyExchangeRate } from "~Model"

const getCurrencies = async (): Promise<string[]> => {
    const currencies = await axios.get<string[]>(
        COINGECKO_SUPPORTED_CURRENCIES_ENDPOINT,
        EXCHANGE_CLIENT_AXIOS_OPTS,
    )

    //Sort alphabetically
    return currencies.data.sort((a, b) => a.localeCompare(b))
}

interface PriceChangeResponse {
    prices: number[][]
}

const getExchangeRate = async (
    fiatSymbol: CURRENCY,
    symbol: string,
    coinGeckoId: string,
): Promise<CurrencyExchangeRate> => {
    const pricesResponse = await axios.get<PriceChangeResponse>(
        COINGECKO_MARKET_CHART_ENDPOINT(coinGeckoId),
        {
            ...EXCHANGE_CLIENT_AXIOS_OPTS,
            params: {
                days: 1,
                vs_currency: fiatSymbol,
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
        symbol,
    }
}

const name = "CoinGecko"

export default {
    getExchangeRate,
    getCurrencies,
    name,
}
