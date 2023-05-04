import { useEffect } from "react"
import { fetchDashboardChartData, useAppDispatch } from "~Storage/Redux"

const TOKEN_BALANCE_SYNC_PERIOD = Number(
    process.env.REACT_APP_TOKEN_BALANCE_SYNC_PERIOD || "300000",
)

export const usePollingChartData = (
    symbol: string,
    days: string | number = 1,
    interval: string = "hourly",
) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const updateHistoricalData = () => {
            dispatch(fetchDashboardChartData({ symbol, days, interval }))
        }

        updateHistoricalData()

        const _interval = setInterval(
            updateHistoricalData,
            TOKEN_BALANCE_SYNC_PERIOD,
        )
        return () => clearInterval(_interval)
    }, [days, dispatch, interval, symbol])
}
