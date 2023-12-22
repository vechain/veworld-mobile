import { useQuery } from "@tanstack/react-query"
import { MarketChartResponse, getMarketChart, getSmartMarketChart, getTokenInfo } from "./endpoints"
import BigNumber from "bignumber.js"
import { max } from "lodash"
import { marketChartTimeframes } from "./constants"
import { VETHOR_COINGECKO_ID, VET_COINGECKO_ID } from "~Constants"

const EXCHANGE_RATE_SYNC_PERIOD = new BigNumber(process.env.REACT_APP_EXCHANGE_RATE_SYNC_PERIOD ?? "120000").toNumber()
const CHART_DATA_SYNC_PERIOD = new BigNumber(process.env.REACT_APP_CHART_DATA_SYNC_PERIOD ?? "300000").toNumber()

const getTokenInfoQueryKey = ({ id }: { id?: string }) => ["TOKEN_INFO", id]

/**
 * Get the token info of a coin
 * @param id  the id of the coin
 * @returns  the token info
 */
export const useTokenInfo = ({ id }: { id?: string }) => {
    return useQuery({
        queryKey: getTokenInfoQueryKey({ id }),
        queryFn: () => getTokenInfo(id),
        enabled: !!id,
        staleTime: EXCHANGE_RATE_SYNC_PERIOD,
    })
}
export const getMarketChartQueryKey = ({
    id,
    vs_currency,
    days,
}: {
    id?: string
    vs_currency: string
    days: number
}) => ["MARKET_CHART", id, vs_currency, days]

/**
 *  Get the market chart of a coin for a given number of days and currency
 * @param id  the id of the coin
 * @param vs_currency  the currency to compare
 * @param days  the number of days to get the market chart for
 * @returns  the market chart array of arrays of [timestamp, price]
 */

export const useMarketChart = ({
    id,
    vs_currency,
    days,
    placeholderData,
}: {
    id?: string
    vs_currency: string
    days: number
    placeholderData?: MarketChartResponse
}) => {
    return useQuery({
        queryKey: getMarketChartQueryKey({ id, vs_currency, days }),
        queryFn: () => getMarketChart({ coinGeckoId: id, vs_currency, days }),
        enabled: !!id,
        placeholderData,
        staleTime: CHART_DATA_SYNC_PERIOD,
    })
}

/**
 * Similar to useMarketChart but tries to reuse the highest resolution chart available (6 months) to derive the smaller intervals
 * This allows us to avoid making multiple requests for the same data, but works only for charts with a resolution > 1 day with daily interval
 * @param id  the id of the coin
 * @param vs_currency  the currency to compare
 * @param days  the number of days to get the market chart for
 * @returns  the market chart array of arrays of [timestamp, price]
 */

export const useSmartMarketChart = ({
    id,
    vs_currency,
    days,
    placeholderData,
}: {
    id?: string
    vs_currency: string
    days: number
    placeholderData?: MarketChartResponse
}) => {
    const highestResolutionTimeframeDays = max(marketChartTimeframes.map(timeframe => timeframe.value)) ?? 180
    const { data: highestResolutionMarketChartData } = useMarketChart({
        id,
        vs_currency,
        days: highestResolutionTimeframeDays,
    })

    return useQuery({
        queryKey: getMarketChartQueryKey({ id, vs_currency, days }),
        queryFn: () => getSmartMarketChart({ highestResolutionMarketChartData, days }),
        enabled: !!highestResolutionMarketChartData,
        staleTime: CHART_DATA_SYNC_PERIOD,
        placeholderData,
    })
}

const getExchangeRateQueryKey = ({ id, vs_currency }: { id?: string; vs_currency: string }) => [
    "EXCHANGE_RATE",
    id,
    vs_currency,
]
/**
 *  Get the exchange rate of a coin reusing the token info
 * @param id  the id of the coin
 * @param vs_currencies  the currencies to compare
 * @returns  the exchange rate
 */
export const useExchangeRate = ({ id, vs_currency }: { id?: string; vs_currency: string }) => {
    const { data: tokenInfo } = useTokenInfo({ id })

    const currency = vs_currency.toLowerCase()

    return useQuery({
        queryKey: getExchangeRateQueryKey({ id, vs_currency }),
        queryFn: () => tokenInfo?.market_data.current_price[currency],
        enabled: !!tokenInfo,
        staleTime: EXCHANGE_RATE_SYNC_PERIOD,
    })
}

/**
 *  Get the exchange rate of VET
 * @param vs_currency  the currencies to compare
 * @returns  the exchange rate
 */
export const useVetExchangeRate = (vs_currency: string) => {
    return useExchangeRate({
        id: VET_COINGECKO_ID,
        vs_currency,
    })
}

/**
 *  Get the exchange rate of VTHO
 * @param vs_currency  the currencies to compare
 * @returns  the exchange rate
 */
export const useVthoExchangeRate = (vs_currency: string) => {
    return useExchangeRate({
        id: VETHOR_COINGECKO_ID,
        vs_currency,
    })
}
