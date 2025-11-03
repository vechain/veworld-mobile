import { useContext } from "react"
import { LinearChartContext } from "../LineChart"

export const useLineChart = () => {
    const { data, selectedPoint, activePointIndex } = useContext(LinearChartContext)
    return {
        data,
        selectedPoint,
        activePointIndex,
    }
}
