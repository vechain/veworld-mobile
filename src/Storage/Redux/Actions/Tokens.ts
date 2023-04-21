import { Dispatch } from "@reduxjs/toolkit"
import axios from "axios"
import {
    COINGECKO_LIST,
    COINGECKO_MARKET_CHART_ENDPOINT,
    error,
    EXCHANGE_CLIENT_AXIOS_OPTS,
    getCoinGeckoIdBySymbol,
} from "~Common"
import { VeChainToken } from "~Model"
import { selectCurrency } from "../Selectors"
import { setCoinGeckoTokens, setDashboardChartData } from "../Slices"
import { AppThunkDispatch, RootState, TokenInfoResponse } from "../Types"
var allSettled = require("promise.allsettled")
import { getTokenInfo } from "../Api"
import { fetchExchangeRates } from "./Currency"

type CoinMarketChartResponse = {
    prices: number[][]
}

export const fetchDashboardChartData =
    ({ symbol }: { symbol: VeChainToken }) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const currency = selectCurrency(getState())
        const coin = getCoinGeckoIdBySymbol[symbol]
        try {
            const pricesResponse = await axios.get<CoinMarketChartResponse>(
                COINGECKO_MARKET_CHART_ENDPOINT(coin),
                {
                    ...EXCHANGE_CLIENT_AXIOS_OPTS,
                    params: {
                        days: 1,
                        vs_currency: currency,
                    },
                },
            )

            const prices = pricesResponse.data.prices.map(ele => ele[1])
            dispatch(setDashboardChartData({ symbol, data: prices }))
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
