import React, { createContext, useCallback, useEffect, useMemo, useState } from "react"
import { DataPoint, LineChartContextType, LineChartData, LineChartProps } from "./types"
import { curveBasis, line, scaleLinear, scaleTime } from "d3"
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
import { COLORS, SCREEN_WIDTH } from "~Constants"
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
import { DateUtils } from "~Utils"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import HapticsService from "~Services/HapticsService"
import { useTheme } from "~Hooks/useTheme"
import { useLineChart } from "./hooks/useLineChart"

//#region Constants

const GRAPH_HEIGHT = 125
const INIT_ANIMATION_DURATION = 1500

const CHIP_PADDING_X = 8
const CHIP_PADDING_Y = 4

//#endregion

//#region Helpers

const makeGraph = (data: DataPoint[], width: number, height: number, strokeWidth: number = 4) => {
    const max = Math.max(...data.map(val => val.value))
    const min = Math.min(...data.map(val => val.value))

    const y = scaleLinear().domain([min, max]).range([height, strokeWidth])
    const x = scaleTime()
        .domain([data[0].timestamp, data[data.length - 1].timestamp])
        .range([0, width])

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

//#endregion

export const LinearChartContext = createContext<LineChartContextType>({
    data: [],
    activePointIndex: null!,
    selectedPoint: null!,
})

const ChartProvider = ({ children, data = [] }: { children: React.ReactNode; data?: LineChartData }) => {
    const activePointIndex = useSharedValue(-1)
    const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)

    useDerivedValue(() => {
        runOnJS(setSelectedPoint)(activePointIndex.value !== -1 ? data[activePointIndex.value] : null)
    }, [activePointIndex.value, data])

    return (
        <LinearChartContext.Provider value={{ data, activePointIndex, selectedPoint }}>
            {children}
        </LinearChartContext.Provider>
    )
}

const _LineChart = ({
    width = SCREEN_WIDTH,
    height = GRAPH_HEIGHT,
    strokeWidth = 4,
    fontSize = 12,
    showHighlight = true,
    showCursor = true,
    showChip = true,
    showGradientBackground = true,
    isInteractive = true,
    strokeColor,
    highlightColor,
    cursorColor,
    chipBackgroundColor,
    chipTextColor,
    gradientBackgroundColors,
    canvasStyle,
}: LineChartProps) => {
    const { data, activePointIndex } = useLineChart()
    const { formatLocale } = useFormatFiat()
    const theme = useTheme()

    const skiaFont = useFont(require("../../../Assets/Fonts/Inter/Inter-SemiBold.ttf"), fontSize)

    const { path, points, maxX, minY, maxY, calcXPos, calcYPos } = useMemo(
        () => makeGraph(data, width, height, strokeWidth),
        [data, width, height, strokeWidth],
    )

    // Initial chartprogress animation
    const progress = useSharedValue(0)
    const backgroundProgress = useSharedValue(0)

    // Line cursor animation
    const translateX = useSharedValue(0)
    const cursorLineOpacity = useSharedValue(0)
    const chipPosition = useSharedValue([{ translateX: 0, translateY: 0 }])
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
            if (finished && showGradientBackground) {
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
        const rect = Skia.XYWHRect(crossHairStart.value, 0, crossHairEnd.value - crossHairStart.value, height)

        return Skia.RRectXY(rect, 16, 16)
    }, [crossHairStart.value, crossHairEnd.value, height])

    const backgroundClipPath = useMemo(() => {
        if (!path || !data) return Skia.RRectXY(Skia.XYWHRect(0, 0, width, height), 16, 16)
        return path.copy().lineTo(maxX, calcYPos(0)).lineTo(calcXPos(0), calcYPos(0)).close()
    }, [calcXPos, calcYPos, data, maxX, path, width, height])

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
            if (x > chipWidth.value / 2 && x < width - chipWidth.value / 2) {
                chipPosition.value = [
                    { translateX: x - chipWidth.value / 2, translateY: chipHeight.value + CHIP_PADDING_Y },
                ]
            }
            // Update the chip timestamp to the nearest point timestamp
            chipTimestamp.value = data?.[pointIdx]?.timestamp ?? 0
        },
        [
            points,
            crossHairStart,
            crossHairEnd,
            chipWidth.value,
            chipTimestamp,
            data,
            chipPosition,
            chipHeight.value,
            width,
        ],
    )

    const panGesture = Gesture.Pan()
        .onBegin(e => {
            translateX.value = e.x
            cursorLineOpacity.value = withTiming(1, { duration: 100 })

            const pointIdx = findNearestPointIndex(e.x)
            activePointIndex.value = pointIdx

            crossHairOpacity.value = withTiming(1, { duration: 100 })
            onPanGesture(e.x, pointIdx)
        })
        .onChange(e => {
            translateX.value = e.x
            const pointIdx = findNearestPointIndex(e.x)
            activePointIndex.value = pointIdx

            runOnJS(HapticsService.triggerHaptics)({ haptics: "Light" })
            onPanGesture(e.x, pointIdx)
        })
        .onFinalize(() => {
            cursorLineOpacity.value = withTiming(0, { duration: 100 })
            translateX.value = withDelay(100, withTiming(0, { duration: 100 }))
            activePointIndex.value = -1

            crossHairStart.value = withTiming(0, { duration: 450 })
            crossHairEnd.value = withTiming(width, { duration: 450 })
            crossHairOpacity.value = withDelay(450, withTiming(0, { duration: 200 }))
        })
        .enabled(isInteractive)

    return (
        <GestureDetector gesture={panGesture}>
            <Canvas style={[canvasStyle, { width, height }]}>
                {showGradientBackground && (
                    <Group clip={backgroundClipPath}>
                        <Rect x={0} y={0} width={width} height={height}>
                            <LinearGradient
                                positions={[0, 0.3, 1]}
                                colors={gradientBackgroundColors || theme.colors.chartGradientBackground}
                                start={backgroudAnimation}
                                end={Skia.Point(maxX, maxY)}
                            />
                        </Rect>
                    </Group>
                )}

                <Path
                    style={"stroke"}
                    path={path!}
                    color={strokeColor || (theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED)}
                    strokeWidth={strokeWidth}
                    strokeJoin={"round"}
                    strokeCap={"round"}
                    start={0}
                    end={progress}
                />

                {showHighlight && (
                    <Group opacity={crossHairOpacity} clip={crossHairClipPath}>
                        {/* Glow layer */}
                        <Path
                            style={"stroke"}
                            path={path!}
                            color={highlightColor || "white"}
                            strokeWidth={strokeWidth * 2}
                            strokeJoin={"round"}
                            strokeCap={"round"}
                            opacity={0.35}>
                            <Blur blur={2.5} />
                        </Path>

                        {/* Main white line */}
                        <Path
                            style={"stroke"}
                            path={path!}
                            color={highlightColor || "white"}
                            strokeWidth={strokeWidth}
                            strokeJoin={"round"}
                            strokeCap={"round"}
                            opacity={1}
                        />
                    </Group>
                )}

                {showCursor && (
                    <Group opacity={cursorLineOpacity}>
                        <Rect
                            x={translateX}
                            y={0}
                            width={1}
                            height={height}
                            color={cursorColor || (theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED)}
                            opacity={cursorLineOpacity}
                        />
                        {showChip && (
                            <Group transform={chipPosition}>
                                <RoundedRect
                                    width={chipWidth}
                                    height={chipHeight}
                                    r={99}
                                    color={chipBackgroundColor || COLORS.PURPLE_DISABLED}
                                />
                                <Text
                                    text={chipTextData}
                                    font={skiaFont}
                                    x={CHIP_PADDING_X}
                                    y={chipTextY}
                                    color={chipTextColor || "white"}
                                />
                            </Group>
                        )}
                    </Group>
                )}
            </Canvas>
        </GestureDetector>
    )
}

export const LineChart = Object.assign(_LineChart, {
    Chart: _LineChart,
    Provider: ChartProvider,
})
