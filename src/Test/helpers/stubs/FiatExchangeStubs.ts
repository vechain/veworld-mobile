import MockAdapter from "axios-mock-adapter"

import coinGeckoCurrenciesResponse from "~Test/helpers/data/FiatExchangeData/CoinGeckoGetCurrenciesResponse.json"
import coinbaseCurrenciesResponse from "~Test/helpers/data/FiatExchangeData/CoinbaseGetCurrenciesResponse.json"
import coinGeckoExchangeRatesResponse from "~Test/helpers/data/FiatExchangeData/CoinGeckoGetRatesResponse.json"
import coinbaseVetExchangeRatesResponse from "~Test/helpers/data/FiatExchangeData/CoinbaseGetVetRatesResponse.json"
import coinbaseVthoExchangeRatesResponse from "~Test/helpers/data/FiatExchangeData/CoinbaseGetVthoRatesResponse.json"

import { Action } from "./consts"

export const mockGetCurrencies = (
    mockAdapter: MockAdapter,
    coinGeckoAction = Action.SUCCESS,
    coinbaseAction = Action.SUCCESS,
) => {
    // Coin Gecko
    const coinGeckoMatcher = mockAdapter.onGet(
        "https://api.coingecko.com/api/v3/simple/supported_vs_currencies",
    )

    if (coinGeckoAction === Action.SUCCESS)
        coinGeckoMatcher.reply(200, coinGeckoCurrenciesResponse)
    else if (coinGeckoAction === Action.ABORT) coinGeckoMatcher.abortRequest()
    else if (coinGeckoAction === Action.NETWORK_ERROR)
        coinGeckoMatcher.networkError()
    else if (coinGeckoAction === Action.API_ERROR) coinGeckoMatcher.reply(403)
    else if (coinGeckoAction === Action.TIMEOUT) coinGeckoMatcher.timeout()

    // Coinbase
    const coinbaseMatcher = mockAdapter.onGet(
        "https://api.coinbase.com/v2/currencies",
    )
    if (coinbaseAction === Action.SUCCESS)
        coinbaseMatcher.reply(200, coinbaseCurrenciesResponse)
    else if (coinbaseAction === Action.ABORT) coinbaseMatcher.abortRequest()
    else if (coinbaseAction === Action.NETWORK_ERROR)
        coinbaseMatcher.networkError()
    else if (coinbaseAction === Action.API_ERROR) coinbaseMatcher.reply(403)
    else if (coinbaseAction === Action.TIMEOUT) coinbaseMatcher.timeout()
}

export const mockGetVetExchangeRate = (
    mockAdapter: MockAdapter,
    coinGeckoAction = Action.SUCCESS,
    coinbaseAction = Action.SUCCESS,
) => {
    // Coin Gecko
    const coinGeckoMatcher = mockAdapter.onGet(
        "https://api.coingecko.com/api/v3/coins/vechain/market_chart",
    )

    if (coinGeckoAction === Action.SUCCESS)
        coinGeckoMatcher.reply(200, coinGeckoExchangeRatesResponse)
    else if (coinGeckoAction === Action.ABORT) coinGeckoMatcher.abortRequest()
    else if (coinGeckoAction === Action.NETWORK_ERROR)
        coinGeckoMatcher.networkError()
    else if (coinGeckoAction === Action.API_ERROR) coinGeckoMatcher.reply(403)
    else if (coinGeckoAction === Action.TIMEOUT) coinGeckoMatcher.timeout()

    // Coinbase
    const coinbaseMatcher = mockAdapter.onGet(
        "https://api.coinbase.com/v2/exchange-rates?currency=VET",
    )

    if (coinbaseAction === Action.SUCCESS)
        coinbaseMatcher.reply(200, coinbaseVetExchangeRatesResponse)
    else if (coinbaseAction === Action.ABORT) coinbaseMatcher.abortRequest()
    else if (coinbaseAction === Action.NETWORK_ERROR)
        coinbaseMatcher.networkError()
    else if (coinbaseAction === Action.API_ERROR) coinbaseMatcher.reply(403)
    else if (coinbaseAction === Action.TIMEOUT) coinbaseMatcher.timeout()
}

export const mockGetVthoExchangeRate = (
    mockAdapter: MockAdapter,
    coinGeckoAction = Action.SUCCESS,
    coinbaseAction = Action.SUCCESS,
) => {
    // Coin Gecko
    const coinGeckoMatcher = mockAdapter.onGet(
        "https://api.coingecko.com/api/v3/coins/vethor-token/market_chart",
    )

    if (coinGeckoAction === Action.SUCCESS)
        coinGeckoMatcher.reply(200, coinGeckoExchangeRatesResponse)
    else if (coinGeckoAction === Action.ABORT) coinGeckoMatcher.abortRequest()
    else if (coinGeckoAction === Action.NETWORK_ERROR)
        coinGeckoMatcher.networkError()
    else if (coinGeckoAction === Action.API_ERROR) coinGeckoMatcher.reply(403)
    else if (coinGeckoAction === Action.TIMEOUT) coinGeckoMatcher.timeout()

    // Coinbase
    const coinbaseMatcher = mockAdapter.onGet(
        "https://api.coinbase.com/v2/exchange-rates?currency=VTHO",
    )

    if (coinbaseAction === Action.SUCCESS)
        coinbaseMatcher.reply(200, coinbaseVthoExchangeRatesResponse)
    else if (coinbaseAction === Action.ABORT) coinbaseMatcher.abortRequest()
    else if (coinbaseAction === Action.NETWORK_ERROR)
        coinbaseMatcher.networkError()
    else if (coinbaseAction === Action.API_ERROR) coinbaseMatcher.reply(403)
    else if (coinbaseAction === Action.TIMEOUT) coinbaseMatcher.timeout()
}

export const mockFiatExchanges = (mockAdapter: MockAdapter) => {
    //Mock Currencies
    mockGetCurrencies(mockAdapter)
    //Mock VET
    mockGetVetExchangeRate(mockAdapter)
    //Mock VTHO
    mockGetVthoExchangeRate(mockAdapter)
}
