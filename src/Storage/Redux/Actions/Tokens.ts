import { Dispatch } from "@reduxjs/toolkit"
import axios from "axios"
import {
    COINGECKO_LIST,
    COINGECKO_MARKET_CHART_ENDPOINT,
    error,
    EXCHANGE_CLIENT_AXIOS_OPTS,
    COINGECKO_TOKEN_ENDPOINT,
    getCoinGeckoIdBySymbol,
    COINGECKO_MARKET_INFO_ENDPOINT,
    VET,
    VTHO,
} from "~Common"
import { TokenUtils } from "~Utils"
import { FungibleToken, NETWORK_TYPE, Network } from "~Model"
import { selectCoinGeckoTokens, selectCurrency } from "../Selectors"
import {
    setAssertDetailChartData,
    setCoinGeckoTokens,
    setCoinMarketInfo,
    setDashboardChartData,
} from "../Slices"
import {
    AppThunkDispatch,
    MarketInfoResponse,
    RootState,
    TokenInfoResponse,
} from "../Types"
const allSettled = require("promise.allsettled")
import { fetchExchangeRates } from "./Currency"

type CoinMarketChartResponse = {
    prices: number[][]
}

export const fetchChartData =
    ({
        symbol,
        days,
        interval,
        isFixedInterval = true,
    }: {
        symbol: string
        days: string | number
        interval: string
        isFixedInterval?: boolean
    }) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const currency = selectCurrency(getState())
        const coin = getCoinGeckoIdBySymbol[symbol]
        const coinGeckoTokens = selectCoinGeckoTokens(getState())
        const foundCoin = coinGeckoTokens.find(
            t => t.symbol.toLowerCase() === symbol.toLowerCase(),
        )

        try {
            const pricesResponse = await axios.get<CoinMarketChartResponse>(
                COINGECKO_MARKET_CHART_ENDPOINT(
                    foundCoin ? foundCoin?.id : coin,
                ),
                {
                    ...EXCHANGE_CLIENT_AXIOS_OPTS,
                    params: {
                        days,
                        interval,
                        vs_currency: currency,
                    },
                },
            )

            const prices = pricesResponse.data.prices
            if (isFixedInterval) {
                dispatch(setDashboardChartData({ symbol, data: prices }))
            } else {
                dispatch(setAssertDetailChartData({ symbol, data: prices }))
            }

            // this will run only the first time ever
            if (!coinGeckoTokens.length) {
                dispatch(setAssertDetailChartData({ symbol, data: prices }))
            }
        } catch (e) {
            error(e)
        }
    }

type FetchTokensResponse = {
    id: string
    symbol: string
    name: string
    platforms: {
        vechain: string
    }
}

export const getTokenInfo = async (tokenId: string) => {
    const response = await axios.get<TokenInfoResponse>(
        COINGECKO_TOKEN_ENDPOINT(tokenId),
        {
            ...EXCHANGE_CLIENT_AXIOS_OPTS,
            params: {
                days: 1,
            },
        },
    )
    return response.data
}

/**
 * Fetches all tokens from CoinGecko that are on the VeChain network
 * and dispatches the results to the store. Then calls "fetchExchangeRates"
 * to fetch the exchange rates for each token.
 */
export const fetchTokensWithInfo = () => async (dispatch: AppThunkDispatch) => {
    try {
        const coinGeckoTokensResponse = await axios.get<FetchTokensResponse[]>(
            COINGECKO_LIST,
            {
                ...EXCHANGE_CLIENT_AXIOS_OPTS,
                params: {
                    days: 1,
                },
            },
        )

        const foundTokens = coinGeckoTokensResponse.data.filter(c =>
            c.platforms.hasOwnProperty("vechain"),
        )

        const tokenPromises: Promise<TokenInfoResponse>[] = []
        for (const token of foundTokens) {
            if (TokenUtils.isVechainToken(token.symbol))
                tokenPromises.push(getTokenInfo(token.id))
        }

        const tokenResults = await allSettled(tokenPromises)

        const coinGeckoTokens: TokenInfoResponse[] = tokenResults.map(
            (result: PromiseSettledResult<TokenInfoResponse>) => {
                if (result.status === "fulfilled") {
                    return result.value
                }
            },
        )

        dispatch(setCoinGeckoTokens(coinGeckoTokens))
        dispatch(fetchExchangeRates({ coinGeckoTokens }))
    } catch (e) {
        error(e)
    }
}

const TOKEN_URL = "https://vechain.github.io/token-registry/"

/**
 * Call out to our github repo and return the tokens for the given network
 */
export const getTokensFromGithub = async ({
    network,
}: {
    network: Network
}): Promise<FungibleToken[]> => {
    let tokens: FungibleToken[] = []

    if (
        network.type === NETWORK_TYPE.MAIN ||
        network.type === NETWORK_TYPE.TEST
    ) {
        const rawTokens = await axios.get(
            `${TOKEN_URL}/${
                network.type === NETWORK_TYPE.MAIN ? "main" : "test"
            }.json`,
            {
                transformResponse: data => data,
                timeout: 30 * 1000,
            },
        )

        const tokensFromGithub = JSON.parse(rawTokens.data) as FungibleToken[]
        tokens = tokensFromGithub.map(token => {
            return {
                ...token,
                genesisId: network.genesis.id,
                icon: `${TOKEN_URL}/assets/${token.icon}`,
                custom: false,
            }
        })
    }

    return tokens
}

export const fetchVechainMarketInfo =
    () => async (dispatch: Dispatch, getState: () => RootState) => {
        const currency = selectCurrency(getState())

        try {
            const pricesResponse = await axios.get<MarketInfoResponse[]>(
                COINGECKO_MARKET_INFO_ENDPOINT(
                    [
                        getCoinGeckoIdBySymbol[VET.symbol],
                        getCoinGeckoIdBySymbol[VTHO.symbol],
                    ],
                    currency,
                ),
                {
                    ...EXCHANGE_CLIENT_AXIOS_OPTS,
                },
            )

            const marketInfo = pricesResponse.data
            dispatch(setCoinMarketInfo({ data: marketInfo }))
        } catch (e) {
            error(e)
        }
    }
