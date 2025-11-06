import { useContext } from "react"
import { LinearChartContext } from "../LineChart"

export const useLineChart = () => {
    const { data, selectedPoint, activePointIndex, isLoading } = useContext(LinearChartContext)
    return {
        data,
        selectedPoint,
        activePointIndex,
        isLoading,
    }
}
