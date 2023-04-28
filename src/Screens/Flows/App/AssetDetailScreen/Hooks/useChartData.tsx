import { selectDashboardChartData, useAppSelector } from "~Storage/Redux"
import { usePollingChartData } from "../../HomeScreen/Hooks"
import { useMemo } from "react"
import { reverse, sortBy } from "lodash"
import moment from "moment"

const AXIS_LABELS = 6

type TokenChartData = {
    timestamp: number
    value: number
}

export const useChartData = (symbol: string) => {
    usePollingChartData(symbol)
    const chartData: TokenChartData[] = useAppSelector(state =>
        selectDashboardChartData(symbol, state),
    )

    const sortedData = useMemo(() => {
        return sortBy(chartData, "value")
    }, [chartData])

    const yAxisLabels = useMemo(
        () => evenlySpacedElements(sortedData, AXIS_LABELS, 2) as number[],
        [sortedData],
    )

    const xAxisLabels = useMemo(
        () =>
            evenlySpacedElements(sortedData, AXIS_LABELS, 1).sort() as string[],
        [sortedData],
    )

    return { chartData, yAxisLabels, xAxisLabels }
}

function evenlySpacedElements(arr: TokenChartData[], n: number, type: number) {
    const result = []
    const interval = (arr.length - 1) / (n - 1)
    if (type === 2) result.push(0)

    const objectKey = type === 1 ? "timestamp" : "value"
    const isTimeStamp = type === 1

    for (let i = 0; i < n; i++) {
        const index = Math.round(i * interval)
        let dataParsed = isTimeStamp
            ? moment(arr[index][objectKey]).format("MMM DD")
            : arr[index][objectKey]
        result.push(dataParsed)
    }

    return reverse(result)
}
