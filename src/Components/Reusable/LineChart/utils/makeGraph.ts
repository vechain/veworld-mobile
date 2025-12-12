import * as d3 from "d3"
import { Skia, vec } from "@shopify/react-native-skia"
import { DataPoint } from "../types"

export const makeGraph = (
    data: DataPoint[],
    width: number,
    height: number,
    strokeWidth: number = 4,
    xGutter: number = 0,
) => {
    if (data.length === 0)
        return {
            path: Skia.Path.Make(),
            points: [],
            maxX: 0,
            minX: 0,
            minY: 0,
            maxY: 0,
            calcXPos: () => 0,
            calcYPos: () => 0,
        }

    const max = Math.max(...data.map(val => val.value))
    const min = Math.min(...data.map(val => val.value))

    const y = d3
        .scaleLinear()
        .domain([min, max])
        .range([height - strokeWidth, strokeWidth])
    const x = d3
        .scaleTime()
        .domain([data[0].timestamp, data[data.length - 1].timestamp])
        .rangeRound([xGutter, width - xGutter])

    const curvedLine = d3
        .line<DataPoint>()
        .x(d => x(d.timestamp))
        .y(d => y(d.value))
        .curve(d3.curveBasis)(data)

    const skPath = Skia.Path.MakeFromSVGString(curvedLine!)

    const skPoints = data.map(d => vec(x(d.timestamp), y(d.value)))

    return {
        path: skPath,
        points: skPoints,
        maxX: x(data[data.length - 1].timestamp),
        minX: x(data[0].timestamp),
        minY: y(min),
        maxY: y(max),
        min,
        max,
        calcXPos: x,
        calcYPos: y,
    }
}
