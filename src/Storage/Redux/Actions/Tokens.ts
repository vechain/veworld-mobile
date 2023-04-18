import { Dispatch } from "@reduxjs/toolkit"
import axios from "axios"
import {
    COINGECKO_MARKET_CHART_ENDPOINT,
    error,
    EXCHANGE_CLIENT_AXIOS_OPTS,
    getCoinGeckoIdBySymbol,
} from "~Common"
import { VeChainToken } from "~Model"
import { selectCurrency } from "../Selectors"
import { setDashboardChartData } from "../Slices"
import { RootState } from "../Types"

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
