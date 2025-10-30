import { Canvas, Group, Path, Rect, Skia, usePathInterpolation } from "@shopify/react-native-skia"
import { curveBasis, curveBasisClosed, curveLinearClosed, line, scaleLinear, scaleTime } from "d3"
import React, { useEffect, useMemo } from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useDerivedValue, useSharedValue, withDelay, withTiming } from "react-native-reanimated"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useTheme } from "~Hooks/useTheme"
import { TokenWithCompleteInfo } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import ChartUtils from "~Utils/ChartUtils"

type Props = {
    token: TokenWithCompleteInfo
}

type DataPoint = {
    timestamp: number
    value: number
}

const SUPPORTED_CHART_TOKENS = new Set(Object.keys(getCoinGeckoIdBySymbol))

const GRAPH_HEIGHT = 125

const makeGraph = (data: DataPoint[]) => {
    const max = Math.max(...data.map(val => val.value))
    const min = Math.min(...data.map(val => val.value))

    const y = scaleLinear().domain([min, max]).range([GRAPH_HEIGHT, 4])
    const x = scaleTime()
        .domain([new Date(data[0].timestamp), new Date(data[data.length - 1].timestamp)])
        .range([0, SCREEN_WIDTH])

    const curvedLine = line<DataPoint>()
        .x(d => x(new Date(d.timestamp)))
        .y(d => y(d.value))
        .curve(curveBasis)(data)

    const skPath = Skia.Path.MakeFromSVGString(curvedLine!)
    const skPoints = data.map(d => Skia.Point(x(new Date(d.timestamp)), y(d.value)))

    return {
        path: skPath,
        points: skPoints,
        min,
        max,
    }
}

export const AssetChartV2 = ({ token }: Props) => {
    const theme = useTheme()
    const currency = useAppSelector(selectCurrency)
    const hasTokenChart = useMemo(() => SUPPORTED_CHART_TOKENS.has(token.symbol), [token.symbol])

    const { data: chartData } = useSmartMarketChart({
        id: hasTokenChart ? getCoinGeckoIdBySymbol[token.symbol] : undefined,
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const downsampleData = useMemo(() => ChartUtils.downsampleData(chartData, "hour", 1, "first"), [chartData])

    const { path, points } = useMemo(() => makeGraph(downsampleData ?? []), [downsampleData])
    const progress = useSharedValue(0)
    const translateX = useSharedValue(0)
    const crossHairStart = useSharedValue(0)
    const crossHairEnd = useSharedValue(0)

    useEffect(() => {
        progress.value = withTiming(1, { duration: 1500 })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const panGesture = Gesture.Pan()
        .onBegin(e => {
            translateX.value = e.x
            const percentage = (e.x * 100) / path!.getBounds().width / 100
            crossHairStart.value = percentage
            crossHairEnd.value = percentage + 0.03
            console.log("onBegin", e.x, percentage)
            console.log(path!.getBounds().width)
        })
        .onChange(e => {
            translateX.value = e.x
            const point = points.findIndex(p => Math.abs(p.x - e.x) < 1)
            const percentage = (e.x * 100) / path!.getBounds().width / 100
            console.log("onChange", e.x, percentage)
            crossHairStart.value = percentage
            crossHairEnd.value = percentage + 0.03

            //const point = points.findIndex(p => Math.abs(p.x - e.x) < 1)
            // if (point !== -1) {
            //     console.log(downsampleData?.[point].timestamp)
            // }
        })

    return (
        <GestureDetector gesture={panGesture}>
            <Canvas style={{ width: SCREEN_WIDTH, height: GRAPH_HEIGHT }}>
                {path && (
                    <>
                        <Path
                            style={"stroke"}
                            path={path}
                            color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED}
                            strokeWidth={4}
                            strokeJoin={"round"}
                            strokeCap={"round"}
                            start={0}
                            end={progress}
                        />
                        <Path
                            style={"stroke"}
                            path={path}
                            color={"white"}
                            strokeWidth={4}
                            strokeJoin={"bevel"}
                            strokeCap={"butt"}
                            start={crossHairStart}
                            end={crossHairEnd}
                        />
                    </>
                )}

                <Rect
                    x={translateX}
                    y={0}
                    width={1}
                    height={GRAPH_HEIGHT}
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED}
                />
            </Canvas>
        </GestureDetector>
    )
}
