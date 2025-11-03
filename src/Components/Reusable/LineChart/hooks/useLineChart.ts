import { useContext } from "react"
import { LinearChartContext } from "../LineChart"

export const useLineChart = () => {
    const { data, selectedPoint } = useContext(LinearChartContext)
    return {
        data,
        selectedPoint,
    }
}
