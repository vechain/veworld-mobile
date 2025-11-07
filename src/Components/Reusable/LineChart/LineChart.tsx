import {
    Blur,
    Canvas,
    Group,
    LinearGradient,
    Path,
    Rect,
    RoundedRect,
    Skia,
    SkPath,
    Text,
    useFont,
} from "@shopify/react-native-skia"
import { interpolatePath } from "d3-interpolate-path"
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react"
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
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { useTheme } from "~Hooks/useTheme"
import HapticsService from "~Services/HapticsService"
import { DateUtils } from "~Utils"
import { useLineChart } from "./hooks/useLineChart"
import { DataPoint, LineChartContextType, LineChartData, LineChartProps } from "./types"
import { makeGraph } from "./utils"
import { DEFAULT_TIMEZONE } from "~Utils/DateUtils/DateUtils"

//#region Constants

const GRAPH_HEIGHT = 125
const INIT_ANIMATION_DURATION = 1500

const CHIP_PADDING_X = 8
const CHIP_PADDING_Y = 4

//#endregion

export const LinearChartContext = createContext<LineChartContextType>({
    data: [],
    isLoading: false,
    activePointIndex: null!,
    selectedPoint: null!,
})

const ChartProvider = ({
    children,
    data = [],
    isLoading = false,
}: {
    children: React.ReactNode
    data?: LineChartData
    isLoading?: boolean
}) => {
    const activePointIndex = useSharedValue(-1)
    const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)

    useDerivedValue(() => {
        runOnJS(setSelectedPoint)(activePointIndex.value !== -1 ? data[activePointIndex.value] : null)
    }, [activePointIndex.value, data])

    const value = useMemo(() => {
        return {
            data,
            isLoading,
            activePointIndex,
            selectedPoint,
        }
    }, [data, isLoading, activePointIndex, selectedPoint])

    return <LinearChartContext.Provider value={value}>{children}</LinearChartContext.Provider>
}

const LineChart = ({
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
    gradientBackgroundPositions = [0, 0.6, 1],
    canvasStyle,
}: LineChartProps) => {
    const { data, activePointIndex, isLoading } = useLineChart()
    const { formatLocale } = useFormatFiat()
    const theme = useTheme()
    const skiaFont = useFont(require("../../../Assets/Fonts/Inter/Inter-SemiBold.ttf"), fontSize)

    const { path, points, maxX, minY, maxY, calcXPos, calcYPos } = useMemo(
        () => makeGraph(data, width, height, strokeWidth),
        [data, width, height, strokeWidth],
    )

    const currentGraph = useSharedValue<SkPath | null>(path)
    const previousGraph = useSharedValue<SkPath | null>(null)

    //Reference to the previous data
    const previousDataRef = useRef(data)
    //Shared value to the current data
    const sharedData = useSharedValue(data)
    //Previous data
    const previousData = previousDataRef.current

    useEffect(() => {
        //Update the shared value to the current data
        if (isLoading) return
        sharedData.value = data
    }, [data, sharedData, isLoading])

    useEffect(() => {
        //Update the previous data reference to the current data
        if (isLoading) return
        previousDataRef.current = data
    }, [data, isLoading])

    useEffect(() => {
        if (!previousData) return
        const graph = makeGraph(previousData, width, height, strokeWidth)
        previousGraph.value = graph.path
    }, [previousData, width, height, strokeWidth, previousGraph])

    // Initial chartprogress animation
    const progress = useSharedValue(0)
    const backgroundProgress = useSharedValue(0)

    // Progress of interpolation between previous and current path
    const morphProgress = useSharedValue(0)
    // Interpolated path between previous and current path
    const interpolatedPath = useSharedValue("M0,0")

    // Line cursor animation
    const translateX = useSharedValue(0)
    const cursorLineOpacity = useSharedValue(0)
    const chipPosition = useSharedValue([{ translateX: 0, translateY: 0 }])
    const chipTimestamp = useSharedValue(0)
    const chipTextValue = useSharedValue("")

    const formatChipTextWorklet = useCallback(
        (timestamp: number) => {
            chipTextValue.value = DateUtils.formatDateTime(timestamp, formatLocale, DEFAULT_TIMEZONE, {
                hideTime: false,
                hideDay: false,
            })
        },
        [chipTextValue, formatLocale],
    )

    // Calculate the chip text value in a worklet function
    useDerivedValue(() => {
        runOnJS(formatChipTextWorklet)(chipTimestamp.value)
    }, [chipTimestamp.value, formatChipTextWorklet])

    const chipWidth = useDerivedValue(() => {
        if (!skiaFont) {
            return 0
        }

        // Measure the text dimensions
        return skiaFont.measureText(chipTextValue.value).width + CHIP_PADDING_X * 2
    }, [chipTextValue.value, skiaFont])

    const chipHeight = useDerivedValue(() => {
        if (!skiaFont) {
            return 0
        }
        return skiaFont?.measureText(chipTextValue.value).height + CHIP_PADDING_Y * 2
    }, [chipTextValue.value, skiaFont])

    const chipTextY = useDerivedValue(() => {
        return chipHeight.value / 2 + CHIP_PADDING_Y
    }, [chipHeight])

    // Cross hair animation
    const crossHairOpacity = useSharedValue(0)
    const crossHairStart = useSharedValue(0)
    const crossHairEnd = useSharedValue(1)

    useEffect(() => {
        if (data.length === 0) return
        progress.value = withTiming(1, { duration: INIT_ANIMATION_DURATION }, finished => {
            if (finished && showGradientBackground) {
                backgroundProgress.value = withTiming(1, { duration: 800 })
            }
        })
    }, [data.length, showGradientBackground, backgroundProgress, progress])

    useEffect(() => {
        if (!isLoading) {
            // Update current graph when loading finishes
            currentGraph.value = path

            // Start morphing animation
            if (previousData && previousData.length !== data.length) {
                morphProgress.value = withTiming(1, { duration: 350 }, finished => {
                    if (finished) {
                        previousGraph.value = path!
                        morphProgress.value = 0
                    }
                })
            }
        }
    }, [isLoading, path, currentGraph, previousGraph, morphProgress, previousData, data.length])

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

    //Workaround to interpolate the path between previous and current path into a worklet function
    const interpolatePathWorklet = useCallback(
        (_start: string, _end: string, _progress: number) => {
            interpolatedPath.value = interpolatePath(_start, _end)(_progress)
        },
        [interpolatedPath],
    )

    //Execute the interpolation in a worklet function
    const makeMorph = useCallback(
        (_start: string, _end: string, _morphProgress: number) => {
            "worklet"
            runOnJS(interpolatePathWorklet)(_start, _end, _morphProgress)
        },
        [interpolatePathWorklet],
    )

    //#region Animations
    const pathAnimation = useDerivedValue(() => {
        const start = previousGraph.value ?? Skia.Path.Make()!
        const end = currentGraph.value!

        makeMorph(start.toSVGString(), end.toSVGString(), morphProgress.value)

        if (!interpolatedPath.value) return Skia.Path.Make()!
        return Skia.Path.MakeFromSVGString(interpolatedPath.value)!
    }, [previousGraph.value, currentGraph.value, morphProgress.value, makeMorph, interpolatedPath.value])

    const backgroudAnimation = useDerivedValue(() => {
        return Skia.Point(maxX, interpolate(backgroundProgress.value, [0, 1], [maxY + 1, minY], Extrapolation.CLAMP))
    }, [backgroundProgress.value, minY, maxY, maxX])

    const crossHairClipPath = useDerivedValue(() => {
        const rect = Skia.XYWHRect(crossHairStart.value, 0, crossHairEnd.value - crossHairStart.value, height)

        return Skia.RRectXY(rect, 16, 16)
    }, [crossHairStart.value, crossHairEnd.value, height])

    //Prepare the line to the max X value
    const lineTo = useMemo(() => {
        return [maxX, calcYPos(0)] as const
    }, [maxX, calcYPos])

    //Prepare the line to the zero value
    const lineToZero = useMemo(() => {
        return [calcXPos(0), calcYPos(0)] as const
    }, [calcXPos, calcYPos])

    const backgroundClipPath = useDerivedValue(() => {
        if (!data) return Skia.RRectXY(Skia.XYWHRect(0, 0, width, height), 16, 16)
        if (previousGraph.value && isLoading)
            return previousGraph.value
                .copy()
                .lineTo(...lineTo)
                .lineTo(...lineToZero)
                .close()

        return pathAnimation.value
            .copy()
            .lineTo(...lineTo)
            .lineTo(...lineToZero)
            .close()
    }, [pathAnimation.value, data, width, height, lineTo, lineToZero])
    //#endregion

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
        .enabled(isInteractive && !isLoading)

    return (
        <GestureDetector gesture={panGesture}>
            <Canvas style={[canvasStyle, { width, height }]}>
                {showGradientBackground && (
                    <Group clip={backgroundClipPath}>
                        <Rect x={0} y={0} width={width} height={height}>
                            <LinearGradient
                                positions={gradientBackgroundPositions}
                                colors={gradientBackgroundColors || theme.colors.chartGradientBackground}
                                start={backgroudAnimation}
                                end={Skia.Point(maxX, maxY)}
                            />
                        </Rect>
                    </Group>
                )}

                <Path
                    style={"stroke"}
                    path={pathAnimation}
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
                            path={pathAnimation}
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
                            path={pathAnimation}
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
                                    text={chipTextValue}
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

LineChart.Provider = ChartProvider

export { LineChart }
