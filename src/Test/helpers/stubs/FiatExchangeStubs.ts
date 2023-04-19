import MockAdapter from "axios-mock-adapter"

import coinGeckoCurrenciesResponse from "../data/FiatExchangeData/CoinGeckoGetCurrenciesResponse.json"
import coinGeckoExchangeRatesResponse from "../data/FiatExchangeData/CoinGeckoGetRatesResponse.json"

import { Action } from "./consts"

export const mockGetCurrencies = (
    mockAdapter: MockAdapter,
    coinGeckoAction = Action.SUCCESS,
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
}

export const mockGetVetExchangeRate = (
    mockAdapter: MockAdapter,
    coinGeckoAction = Action.SUCCESS,
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
}

export const mockGetVthoExchangeRate = (
    mockAdapter: MockAdapter,
    coinGeckoAction = Action.SUCCESS,
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
}

export const mockFiatExchanges = (mockAdapter: MockAdapter) => {
    //Mock Currencies
    mockGetCurrencies(mockAdapter)
    //Mock VET
    mockGetVetExchangeRate(mockAdapter)
    //Mock VTHO
    mockGetVthoExchangeRate(mockAdapter)
}
