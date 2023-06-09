import axios from "axios"
import { EXCHANGE_CLIENT_AXIOS_OPTS } from "~Constants"
import { CurrencyExchangeRate } from "~Model"

const COINBASE_URL = process.env.REACT_APP_COINBASE_URL

/**
 * The currency object returned from CoinBase
 * @field `id` - The 3 letter symbol
 * @field `name` - The friendly name of the currency
 */
interface Currency {
    id: string
    name: string
}

/**
 * The response containing all the currencies
 */
interface CurrenciesResponse {
    data: Currency[]
}

interface ExchangeRates {
    [symbol: string]: number
}

/**
 * The currency object returned from CoinBase
 * @field `rates` - An object containing the rates
 * @field `name` - The requested currency symbol
 */
interface ExchangeRateResponseBody {
    rates: ExchangeRates
    currency: string
}

/**
 * The response containing the exchange rates
 */
interface ExchangeRateResponse {
    data: ExchangeRateResponseBody
}

const getCurrencies = async (): Promise<string[]> => {
    const currencies = await axios.get<CurrenciesResponse>(
        `${COINBASE_URL}/currencies`,
        EXCHANGE_CLIENT_AXIOS_OPTS,
    )

    //Sort alphabetically
    return currencies.data.data
        .map(curr => {
            return curr.id
        })
        .sort((a, b) => a.localeCompare(b))
}

const getExchangeRate = async (
    fiatSymbol: string,
    symbol: string,
): Promise<CurrencyExchangeRate> => {
    const exchangeRates = await axios.get<ExchangeRateResponse>(
        `${COINBASE_URL}/exchange-rates?currency=${symbol}`,
        EXCHANGE_CLIENT_AXIOS_OPTS,
    )

    const rate = exchangeRates.data.data.rates[fiatSymbol.toUpperCase()]

    return {
        rate,
    }
}

const name = "Coinbase"

export default {
    getExchangeRate,
    getCurrencies,
    name,
}
