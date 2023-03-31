import axios from "axios"
import { VET } from "~Common/Constant/Token/TokenConstants"
import { VeChainToken } from "~Model"
import { CurrencyExchangeRate } from "~Model/Currency/Currency"
import { EXCHANGE_CLIENT_AXIOS_OPTS } from "./constants"

const getCurrencies = async (): Promise<string[]> => {
    const currencies = await axios.get<string[]>(
        `${process.env.REACT_APP_COINGECKO_URL}/simple/supported_vs_currencies`,
        EXCHANGE_CLIENT_AXIOS_OPTS,
    )

    //Sort alphabetically
    return currencies.data.sort((a, b) => a.localeCompare(b))
}

interface PriceChangeResponse {
    prices: number[][]
}

const getExchangeRate = async (
    fiatSymbol: string,
    symbol: VeChainToken,
): Promise<CurrencyExchangeRate> => {
    const coin = symbol === VET.symbol ? "vechain" : "vethor-token"

    const pricesResponse = await axios.get<PriceChangeResponse>(
        `${process.env.REACT_APP_COINGECKO_URL}/coins/${coin}/market_chart`,
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
    }
}

const name = "CoinGecko"

export default {
    getExchangeRate,
    getCurrencies,
    name,
}
