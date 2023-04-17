import { Dispatch } from "@reduxjs/toolkit"
import axios from "axios"
import { error, EXCHANGE_CLIENT_AXIOS_OPTS, VET } from "~Common"
import { VeChainToken } from "~Model"
import { selectCurrency } from "../Selectors"
import { setDashboardChartData } from "../Slices"
import { RootState } from "../Types"

type CoinMarketChartResponse = {
    prices: number[][]
}

export const fetchHistoricalData =
    ({ symbol }: { symbol: VeChainToken }) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const currency = selectCurrency(getState())
        const coin = symbol === VET.symbol ? "vechain" : "vethor-token"
        try {
            const pricesResponse = await axios.get<CoinMarketChartResponse>(
                `${process.env.REACT_APP_COINGECKO_URL}/coins/${coin}/market_chart`,
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
