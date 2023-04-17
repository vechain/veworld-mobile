import { useEffect } from "react"
import { VeChainToken } from "~Model"
import { fetchHistoricalData, useAppDispatch } from "~Storage/Redux"

const TOKEN_BALANCE_SYNC_PERIOD = Number(
    process.env.REACT_APP_TOKEN_BALANCE_SYNC_PERIOD || "300000",
)

export const usePollingChartData = (symbol: VeChainToken) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const updateHistoricalData = () => {
            dispatch(fetchHistoricalData({ symbol }))
        }
        updateHistoricalData()
        const interval = setInterval(
            updateHistoricalData,
            TOKEN_BALANCE_SYNC_PERIOD,
        )
        return () => clearInterval(interval)
    }, [dispatch, symbol])
}
