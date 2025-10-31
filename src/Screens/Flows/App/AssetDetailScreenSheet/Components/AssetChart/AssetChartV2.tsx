import {
    Blur,
    Canvas,
    Group,
    LinearGradient,
    Path,
    Points,
    Rect,
    Skia,
    usePathInterpolation,
    vec,
} from "@shopify/react-native-skia"
import { curveBasis, curveBasisClosed, curveLinearClosed, line, scaleLinear, scaleTime } from "d3"
import React, { useEffect, useMemo } from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useDerivedValue, useSharedValue, withDelay, withTiming } from "react-native-reanimated"
import { ClipPath } from "react-native-svg"
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
        .domain([data[0].timestamp, data[data.length - 1].timestamp])
        .range([0, SCREEN_WIDTH])

    const curvedLine = line<DataPoint>()
        .x(d => x(d.timestamp))
        .y(d => y(d.value))
        .curve(curveBasis)(data)

    const skPath = Skia.Path.MakeFromSVGString(curvedLine!)!
        .lineTo(x(data[data.length - 1].timestamp), y(0))
        .lineTo(x(0), y(0))
        .close()

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

    const { path, points, maxX, minY, maxY } = useMemo(() => makeGraph(downsampleData ?? []), [downsampleData])

    // Initial chartprogress animation
    const progress = useSharedValue(0)

    // Line cursor animation
    const translateX = useSharedValue(0)
    const cursorLineOpacity = useSharedValue(0)

    // Cross hair animation
    const crossHairOpacity = useSharedValue(0)
    const crossHairStart = useSharedValue(0)
    const crossHairEnd = useSharedValue(1)

    const sharedIndex = useSharedValue(0)

    useEffect(() => {
        progress.value = withTiming(1, { duration: 1500 })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const findNearestPointIndex = (x: number) => {
        "worklet"
        let nearestIdx = 0
        let minDistance = Math.abs(points[0].x - x)

        for (let i = 1; i < points.length; i++) {
            const distance = Math.abs(points[i].x - x)
            if (distance < minDistance) {
                minDistance = distance
                nearestIdx = i
            }
        }

        return nearestIdx
    }

    const derivedClipPath = useDerivedValue(() => {
        const rect = Skia.XYWHRect(
            crossHairStart.value * SCREEN_WIDTH,
            0,
            (crossHairEnd.value - crossHairStart.value) * SCREEN_WIDTH,
            GRAPH_HEIGHT,
        )

        return Skia.RRectXY(rect, 16, 16)
    }, [crossHairStart.value, crossHairEnd.value])

    const panGesture = Gesture.Pan()
        .onBegin(e => {
            translateX.value = e.x
            cursorLineOpacity.value = withTiming(1, { duration: 100 })

            const pointIdx = findNearestPointIndex(e.x)
            const pointPerc = pointIdx / (points.length - 1)
            crossHairOpacity.value = withTiming(1, { duration: 100 })
            crossHairStart.value = withTiming(Math.max(0, pointPerc - 0.03), { duration: 300 })
            crossHairEnd.value = withTiming(Math.min(1, pointPerc + 0.03), { duration: 300 })
        })
        .onChange(e => {
            translateX.value = e.x
            const pointIdx = findNearestPointIndex(e.x)
            const percentage = pointIdx / (points.length - 1)
            // const prevPointPercentage = (pointIdx - 1) / (points.length - 1)
            // const nextPointPercentage = (pointIdx + 1) / (points.length - 1)

            if (pointIdx > 0 && pointIdx < points.length - 1) {
                sharedIndex.value = pointIdx
                const point = points[pointIdx]

                const offset = e.x - point.x

                console.log("offset", offset)

                const prevPoint = points[pointIdx - 1].x + offset
                const nextPoint = points[pointIdx + 1].x + offset

                const prevPointPercentage = prevPoint / points[points.length - 1].x
                const nextPointPercentage = nextPoint / points[points.length - 1].x

                console.log("prevPointPercentage", prevPointPercentage)
                console.log("nextPointPercentage", nextPointPercentage)

                crossHairStart.value = withTiming(prevPointPercentage + 0.02, { duration: 200 })
                crossHairEnd.value = withTiming(nextPointPercentage - 0.02, { duration: 200 })
            }

            //const point = points.findIndex(p => Math.abs(p.x - e.x) < 1)
            // if (point !== -1) {
            //     console.log(downsampleData?.[point].timestamp)
            // }
        })
        .onFinalize(() => {
            cursorLineOpacity.value = withTiming(0, { duration: 100 })
            translateX.value = withDelay(100, withTiming(0, { duration: 100 }))

            crossHairStart.value = withTiming(0, { duration: 500 })
            crossHairEnd.value = withTiming(1, { duration: 500 })
            crossHairOpacity.value = withDelay(450, withTiming(0, { duration: 200 }))
        })

    return (
        <GestureDetector gesture={panGesture}>
            <Canvas style={{ width: SCREEN_WIDTH, height: GRAPH_HEIGHT }}>
                {/* <Points points={points} color={"red"} mode="points" strokeWidth={5} /> */}
                {/* <Points points={nearestPoint} color={"green"} mode="points" strokeWidth={5} /> */}
                {path && (
                    <Group clip={path!}>
                        <Rect x={0} y={0} width={SCREEN_WIDTH} height={GRAPH_HEIGHT}>
                            <LinearGradient
                                positions={[0, 0.2, 1]}
                                colors={["rgba(38, 30, 76, 0)", "rgba(68, 59, 110, 0.5)", "rgba(185, 181, 207, 1)"]}
                                end={Skia.Point(maxX, maxY)}
                                start={Skia.Point(maxX, minY)}
                            />
                        </Rect>
                    </Group>
                )}

                <Path
                    style={"stroke"}
                    path={path!}
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED}
                    strokeWidth={4}
                    strokeJoin={"round"}
                    strokeCap={"round"}
                    start={0}
                    end={progress}
                />

                <Group opacity={crossHairOpacity} clip={derivedClipPath}>
                    {/* Glow layer */}
                    <Path
                        style={"stroke"}
                        path={path!}
                        color={"white"}
                        strokeWidth={8}
                        strokeJoin={"round"}
                        strokeCap={"round"}
                        opacity={0.35}>
                        <Blur blur={2.5} />
                    </Path>

                    {/* Main white line */}
                    <Path
                        style={"stroke"}
                        path={path!}
                        color={"white"}
                        strokeWidth={4}
                        strokeJoin={"round"}
                        strokeCap={"round"}
                        opacity={1}
                    />
                </Group>

                <Rect
                    x={translateX}
                    y={0}
                    width={1}
                    height={GRAPH_HEIGHT}
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED}
                    opacity={cursorLineOpacity}
                />
            </Canvas>
        </GestureDetector>
    )
}
