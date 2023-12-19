import { useQuery } from "@tanstack/react-query"
import { MarketChartResponse, getMarketChart } from "./endpoints"
import BigNumber from "bignumber.js"

// const EXCHANGE_RATE_SYNC_PERIOD = new BigNumber(
//     process.env.REACT_APP_EXCHANGE_RATE_SYNC_PERIOD ?? "120000",
// ).toNumber()
const CHART_DATA_SYNC_PERIOD = new BigNumber(process.env.REACT_APP_CHART_DATA_SYNC_PERIOD ?? "300000").toNumber()

const getMarketChartQueryKey = ({ id, vs_currency, days }: { id?: string; vs_currency: string; days: number }) => [
    "MARKET_CHART",
    id,
    vs_currency,
    days,
]

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
