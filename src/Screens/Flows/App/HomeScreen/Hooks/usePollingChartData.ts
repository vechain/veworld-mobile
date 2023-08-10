import { useEffect } from "react"
import { fetchChartData, useAppDispatch } from "~Storage/Redux"

const TOKEN_BALANCE_SYNC_PERIOD = Number(
    process.env.REACT_APP_TOKEN_BALANCE_SYNC_PERIOD || "300000",
)

export const usePollingChartData = (
    symbol: string,
    days: string | number = 7,
    interval: string = "daily",
) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const updateHistoricalData = () => {
            dispatch(fetchChartData({ symbol, days, interval }))
        }

        updateHistoricalData()

        const _interval = setInterval(
            updateHistoricalData,
            TOKEN_BALANCE_SYNC_PERIOD,
        )
        return () => clearInterval(_interval)
    }, [days, dispatch, interval, symbol])
}
