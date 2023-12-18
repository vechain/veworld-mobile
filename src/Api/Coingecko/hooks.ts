import { useQuery } from "@tanstack/react-query"
import {
    MarketChartResponse,
    VETHOR_COINGECKO_ID,
    VET_COINGECKO_ID,
    getCoinGeckoIdBySymbol,
    getExchangeRate,
    getMarketChart,
    getMarketInfo,
} from "./endpoints"

const getExchangeRateQueryKey = ({
    id,
    vs_currency,
}: {
    id?: string
    vs_currency: string
}) => ["EXCHANGE_RATE", id, vs_currency]
/**
 *  Get the exchange rate of a coin
 * @param id  the id of the coin
 * @param vs_currencies  the currencies to compare
 * @returns  the exchange rate
 */
export const useExchangeRate = ({
    id,
    vs_currency,
}: {
    id?: string
    vs_currency: string
}) => {
    return useQuery({
        queryKey: getExchangeRateQueryKey({ id, vs_currency }),
        queryFn: () => getExchangeRate({ coinGeckoId: id, vs_currency }),
        enabled: !!id,
    })
}

const getMarketsInfoQueryKey = ({ vs_currency }: { vs_currency: string }) => [
    "MARKET_INFO",
    vs_currency,
]

/**
 * Get the market info of all supported coins for a given currency (getCoinGeckoIdBySymbol)
 * @param vs_currency  the currency to compare
 * @returns  the market info
 */
export const useMarketsInfo = ({ vs_currency }: { vs_currency: string }) => {
    const coinGeckoIds = Object.values(getCoinGeckoIdBySymbol)
    return useQuery({
        queryKey: getMarketsInfoQueryKey({ vs_currency }),
        queryFn: () => getMarketInfo({ coinGeckoIds, vs_currency }),
        staleTime: Infinity,
    })
}

const getMarketInfoQueryKey = ({
    id,
    vs_currency,
}: {
    id: string | number
    vs_currency: string
}) => ["MARKET_INFO", vs_currency, id]

/**
 * Get the market info of a coin for a given currency
 * @param id  the id of the coin
 * @param vs_currency  the currency to compare
 * @returns  the market info
 */
export const useMarketInfo = ({
    id,
    vs_currency,
}: {
    id: string | number
    vs_currency: string
}) => {
    const { data: marketsInfo } = useMarketsInfo({ vs_currency })
    return useQuery({
        queryKey: getMarketInfoQueryKey({ id, vs_currency }),
        queryFn: () => {
            return marketsInfo?.find(market => market.id === id)
        },
        staleTime: Infinity,
        enabled: !!marketsInfo,
    })
}

const getMarketChartQueryKey = ({
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

export const DEFAULT_CHART_DATA = [
    { timestamp: 0, value: 1 },
    { timestamp: 1, value: 1 },
    { timestamp: 2, value: 1 },
    { timestamp: 3, value: 1 },
    { timestamp: 4, value: 1 },
    { timestamp: 5, value: 1 },
    { timestamp: 6, value: 1 },
    { timestamp: 7, value: 1 },
    { timestamp: 8, value: 1 },
    { timestamp: 9, value: 1 },
    { timestamp: 10, value: 1 },
    { timestamp: 11, value: 1 },
    { timestamp: 12, value: 1 },
]

export const useMarketChart = ({
    id,
    vs_currency,
    days,
    initialData,
}: {
    id?: string
    vs_currency: string
    days: number
    initialData?: MarketChartResponse
}) => {
    return useQuery({
        queryKey: getMarketChartQueryKey({ id, vs_currency, days }),
        queryFn: () => getMarketChart({ coinGeckoId: id, vs_currency, days }),
        enabled: !!id,
        initialData,
        staleTime: Number(
            process.env.REACT_APP_CHART_DATA_SYNC_PERIOD ?? 1000 * 60 * 5,
        ),
    })
}

/**
 *  Get the exchange rate of VET
 * @param vs_currencies  the currencies to compare
 * @returns  the exchange rate
 */
export const useVetExchangeRate = (vs_currency: string) => {
    return useQuery({
        queryKey: getExchangeRateQueryKey({
            id: VET_COINGECKO_ID,
            vs_currency,
        }),
        queryFn: () =>
            getExchangeRate({ coinGeckoId: VET_COINGECKO_ID, vs_currency }),
    })
}

/**
 *  Get the exchange rate of VTHO
 * @param vs_currencies  the currencies to compare
 * @returns  the exchange rate
 */
export const useVthoExchangeRate = (vs_currency: string) => {
    return useQuery({
        queryKey: getExchangeRateQueryKey({
            id: VETHOR_COINGECKO_ID,
            vs_currency,
        }),
        queryFn: () =>
            getExchangeRate({ coinGeckoId: VETHOR_COINGECKO_ID, vs_currency }),
    })
}
