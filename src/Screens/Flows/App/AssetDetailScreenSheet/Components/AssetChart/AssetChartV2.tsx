import {
    Blur,
    Canvas,
    Group,
    LinearGradient,
    Path,
    Rect,
    RoundedRect,
    Skia,
    Text,
    useFont,
    vec,
} from "@shopify/react-native-skia"
import { curveBasis, line, scaleLinear, scaleTime } from "d3"
import React, { useCallback, useEffect, useMemo } from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import {
    Extrapolation,
    interpolate,
    runOnJS,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useFormatFiat } from "~Hooks"
import { useTheme } from "~Hooks/useTheme"
import { TokenWithCompleteInfo } from "~Model"
import HapticsService from "~Services/HapticsService"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { DateUtils } from "~Utils"
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
const INIT_ANIMATION_DURATION = 1500

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

export const AssetChartV2 = ({ token }: Props) => {
    const theme = useTheme()
    const currency = useAppSelector(selectCurrency)
    const hasTokenChart = useMemo(() => SUPPORTED_CHART_TOKENS.has(token.symbol), [token.symbol])
    const skiaFont = useFont(require("../../../../../../Assets/Fonts/Inter/Inter-SemiBold.ttf"), 12)
    const { formatLocale } = useFormatFiat()

    // Define your padding
    const CHIP_PADDING_X = 8
    const CHIP_PADDING_Y = 4

    const { data: chartData } = useSmartMarketChart({
        id: hasTokenChart ? getCoinGeckoIdBySymbol[token.symbol] : undefined,
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const downsampleData = useMemo(() => ChartUtils.downsampleData(chartData, "hour", 1, "first"), [chartData])

    const { path, points, maxX, minY, maxY, calcXPos, calcYPos } = useMemo(
        () => makeGraph(downsampleData ?? []),
        [downsampleData],
    )

    // Initial chartprogress animation
    const progress = useSharedValue(0)
    const backgroundProgress = useSharedValue(0)

    // Line cursor animation
    const translateX = useSharedValue(0)
    const cursorLineOpacity = useSharedValue(0)
    const chipPosition = useSharedValue([{ translateX: 0, translateY: 10 }])
    const chipTimestamp = useSharedValue(0)

    // Create a derived value for the chip text and its dimensions
    const chipTextData = useDerivedValue(() => {
        return DateUtils.formatDateTimeWorklet(chipTimestamp.value, formatLocale, {
            hideTime: false,
            hideDay: false,
        })
    }, [chipTimestamp.value, skiaFont, formatLocale])

    const chipWidth = useDerivedValue(() => {
        if (!skiaFont) {
            return 0
        }

        // Measure the text dimensions
        return skiaFont.measureText(chipTextData.value).width + CHIP_PADDING_X * 2
    }, [chipTextData, skiaFont])

    const chipHeight = useDerivedValue(() => {
        if (!skiaFont) {
            return 0
        }

        return skiaFont?.measureText(chipTextData.value).height + CHIP_PADDING_Y * 2
    }, [chipTextData, skiaFont])

    const chipTextY = useDerivedValue(() => {
        return chipHeight.value / 2 + CHIP_PADDING_Y
    }, [chipHeight])

    // Cross hair animation
    const crossHairOpacity = useSharedValue(0)
    const crossHairStart = useSharedValue(0)
    const crossHairEnd = useSharedValue(1)

    useEffect(() => {
        progress.value = withTiming(1, { duration: INIT_ANIMATION_DURATION }, finished => {
            if (finished) {
                backgroundProgress.value = withTiming(1, { duration: 800 })
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const findNearestPointIndex = useCallback(
        (x: number) => {
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
        },
        [points],
    )

    const backgroudAnimation = useDerivedValue(() => {
        return Skia.Point(maxX, interpolate(backgroundProgress.value, [0, 1], [maxY + 1, minY], Extrapolation.CLAMP))
    }, [backgroundProgress.value, minY, maxY, maxX])

    const crossHairClipPath = useDerivedValue(() => {
        const rect = Skia.XYWHRect(crossHairStart.value, 0, crossHairEnd.value - crossHairStart.value, GRAPH_HEIGHT)

        return Skia.RRectXY(rect, 16, 16)
    }, [crossHairStart.value, crossHairEnd.value])

    const backgroundClipPath = useMemo(() => {
        if (!path || !downsampleData) return Skia.RRectXY(Skia.XYWHRect(0, 0, SCREEN_WIDTH, GRAPH_HEIGHT), 16, 16)
        return path.copy().lineTo(maxX, calcYPos(0)).lineTo(calcXPos(0), calcYPos(0)).close()
    }, [calcXPos, calcYPos, downsampleData, maxX, path])

    /**
     * On pan gesture, update the cross hair start and end values
     * @param x - The x position of the pan gesture
     * @param pointIdx - The index of the nearest point
     */
    const onPanGesture = useCallback(
        (x: number, pointIdx: number) => {
            "worklet"
            const point = points[pointIdx]
            const offset = x - point.x

            const prevPoint = pointIdx > 0 ? points[pointIdx - 1].x + offset : points[0].x + offset
            const nextPoint =
                pointIdx < points.length - 1 ? points[pointIdx + 1].x + offset : points[points.length - 1].x + offset

            crossHairStart.value = withSpring(prevPoint, { damping: 100, stiffness: 100 })
            crossHairEnd.value = withSpring(nextPoint, { damping: 100, stiffness: 100 })

            // Only update the chip position if the x position is within the chip text width
            if (x > chipWidth.value / 2 && x < SCREEN_WIDTH - chipWidth.value / 2) {
                chipPosition.value = [
                    { translateX: x - chipWidth.value / 2, translateY: chipHeight.value + CHIP_PADDING_Y },
                ]
            }
            // Update the chip timestamp to the nearest point timestamp
            chipTimestamp.value = downsampleData?.[pointIdx]?.timestamp ?? 0
        },
        [
            points,
            crossHairStart,
            crossHairEnd,
            chipWidth.value,
            chipTimestamp,
            downsampleData,
            chipPosition,
            chipHeight.value,
        ],
    )

    const panGesture = Gesture.Pan()
        .onBegin(e => {
            translateX.value = e.x
            cursorLineOpacity.value = withTiming(1, { duration: 100 })

            const pointIdx = findNearestPointIndex(e.x)

            crossHairOpacity.value = withTiming(1, { duration: 100 })
            onPanGesture(e.x, pointIdx)
        })
        .onChange(e => {
            translateX.value = e.x
            const pointIdx = findNearestPointIndex(e.x)

            runOnJS(HapticsService.triggerHaptics)({ haptics: "Light" })
            onPanGesture(e.x, pointIdx)

            //const point = points.findIndex(p => Math.abs(p.x - e.x) < 1)
            // if (point !== -1) {
            // }
        })
        .onFinalize(() => {
            cursorLineOpacity.value = withTiming(0, { duration: 100 })
            translateX.value = withDelay(100, withTiming(0, { duration: 100 }))

            crossHairStart.value = withTiming(0, { duration: 450 })
            crossHairEnd.value = withTiming(SCREEN_WIDTH, { duration: 450 })
            crossHairOpacity.value = withDelay(450, withTiming(0, { duration: 200 }))
        })

    return (
        <GestureDetector gesture={panGesture}>
            <Canvas style={{ width: SCREEN_WIDTH, height: GRAPH_HEIGHT }}>
                <Group clip={backgroundClipPath}>
                    <Rect x={0} y={0} width={SCREEN_WIDTH} height={GRAPH_HEIGHT}>
                        <LinearGradient
                            positions={[0, 0.3, 1]}
                            colors={theme.colors.chartGradientBackground}
                            start={backgroudAnimation}
                            end={Skia.Point(maxX, maxY)}
                        />
                    </Rect>
                </Group>

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

                <Group opacity={crossHairOpacity} clip={crossHairClipPath}>
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

                <Group opacity={cursorLineOpacity}>
                    <Rect
                        x={translateX}
                        y={0}
                        width={1}
                        height={GRAPH_HEIGHT}
                        color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED}
                        opacity={cursorLineOpacity}
                    />
                    <Group transform={chipPosition}>
                        <RoundedRect width={chipWidth} height={chipHeight} r={99} color={COLORS.PURPLE_DISABLED} />
                        <Text text={chipTextData} font={skiaFont} x={CHIP_PADDING_X} y={chipTextY} color="white" />
                    </Group>
                </Group>
            </Canvas>
        </GestureDetector>
    )
}
