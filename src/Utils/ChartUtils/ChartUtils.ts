import moment from "moment"
import { MarketChartResponse } from "~Api/Coingecko"
import { BigNumberUtils } from "~Utils/BigNumberUtils"

/**
 * Returns the price change from the last point to the first
 * @param data Data to display in the chart
 */
export const getPriceChange = (data?: MarketChartResponse) => {
    if (!data || data.length === 0) return 0
    const openPrice = data[0].value
    const closePrice = data[data.length - 1].value

    return closePrice - openPrice
}

/**
 * Returns the price change (in percentage) from the last point to the first
 * @param data Data to display in the chart
 */
export const getPercentagePriceChange = (data?: MarketChartResponse) => {
    if (!data || data.length === 0) return 0
    const openPrice = data[0].value
    const closePrice = data[data.length - 1].value

    return ((closePrice - openPrice) / openPrice) * 100
}

/**
 * Downsample data to create a record for every hour of the dataset.
 * The value will be computed as the average per hour.
 * @param data Data to downsample
 * @param unit Unit to downsample. Defaults to hour
 * @param interval Interval to downsample. Defaults to 1
 * @returns Data, but downsampled
 */
export const downsampleData = (data: MarketChartResponse | undefined, unit: "hour" | "day" = "hour", interval = 1) => {
    if (!data) return undefined

    return [
        ...data
            .reduce((acc, curr) => {
                //Create a map <timestamp, value[]> to then perform an average.
                const initialUnit = moment(curr.timestamp).startOf(unit)
                const result = Math.floor(initialUnit[unit]() / interval) * interval
                const key = initialUnit[unit](result).valueOf()
                if (acc.has(key)) {
                    acc.get(key)?.push(curr.value)
                    return acc
                }
                acc.set(key, [curr.value])
                return acc
            }, new Map<number, number[]>())
            .entries(),
    ].map(([timestamp, values]) => ({
        timestamp: timestamp,
        //Perform the average for every hour
        value: BigNumberUtils.average(values).toNumber,
    }))
}
