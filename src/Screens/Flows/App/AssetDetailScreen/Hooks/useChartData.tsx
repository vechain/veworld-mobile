import { useCallback, useEffect } from "react"
import {
    fetchDashboardChartData,
    selectDashboardChartData,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type TokenChartData = {
    timestamp: number
    value: number
}

export const useChartData = (symbol: string) => {
    const dispatch = useAppDispatch()

    const getChartData = useCallback(
        (days: number = 1, interval: string = "hourly") => {
            dispatch(
                fetchDashboardChartData({
                    symbol: symbol,
                    days: days,
                    interval: interval,
                }),
            )
        },
        [dispatch, symbol],
    )

    useEffect(() => {
        getChartData()
    }, [dispatch, getChartData, symbol])

    const chartData: TokenChartData[] = useAppSelector(state =>
        selectDashboardChartData(symbol, state),
    )

    return { chartData, getChartData }
}
