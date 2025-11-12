import { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import Animated, {
    useAnimatedRef,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Extrapolation,
    useDerivedValue,
    scrollTo,
} from "react-native-reanimated"

export interface UseAnimatedHorizontalFiltersProps<T> {
    items: T[]
    selectedItem: T
    keyExtractor: (item: T) => string | number
    size: "sm" | "md"
}

export const CHIP_PADDING = {
    sm: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        minWidth: 48,
    },
    md: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 64,
    },
} as const

export const useAnimatedHorizontalFilters = <T>({
    items,
    selectedItem,
    keyExtractor,
    size,
}: UseAnimatedHorizontalFiltersProps<T>) => {
    const scrollViewRef = useAnimatedRef<Animated.ScrollView>()

    const [measurements, setMeasurements] = useState<{
        chipPositions: number[]
        chipWidths: number[]
        chipHeights: number[]
        scrollViewWidth: number
    }>({
        chipPositions: [],
        chipWidths: [],
        chipHeights: [],
        scrollViewWidth: 0,
    })

    const scrollValue = useSharedValue(0)
    const scrollOffset = useSharedValue(0)
    const targetScrollX = useSharedValue(0)

    const selectedIndex = useMemo(
        () => items.findIndex(item => keyExtractor(item) === keyExtractor(selectedItem)),
        [items, selectedItem, keyExtractor],
    )

    const isReady = useMemo(
        () =>
            measurements.chipPositions.length === items.length &&
            measurements.chipWidths.length === items.length &&
            measurements.chipHeights.length === items.length,
        [
            measurements.chipPositions.length,
            measurements.chipWidths.length,
            measurements.chipHeights.length,
            items.length,
        ],
    )

    const contentBounds = useMemo(() => {
        if (!isReady) return { totalWidth: 0, maxScroll: 0 }

        const totalWidth = Math.max(...measurements.chipPositions) + Math.max(...measurements.chipWidths) + 20
        const totalHeight = Math.max(...measurements.chipHeights)
        const maxScroll = Math.max(0, totalWidth - measurements.scrollViewWidth)

        return { totalWidth, totalHeight, maxScroll }
    }, [isReady, measurements])

    useDerivedValue(() => {
        scrollTo(scrollViewRef, targetScrollX.value, 0, true)
    }, [scrollViewRef, targetScrollX])

    useEffect(() => {
        if (selectedIndex < 0 || !isReady) return

        scrollValue.value = withTiming(selectedIndex, { duration: 150 })

        const chipPosition = measurements.chipPositions[selectedIndex]
        const chipWidth = measurements.chipWidths[selectedIndex]
        const chipCenter = chipPosition + chipWidth / 2
        const viewportCenter = measurements.scrollViewWidth / 2

        let scrollToX = chipCenter - viewportCenter
        scrollToX = Math.max(0, Math.min(scrollToX, contentBounds.maxScroll))

        targetScrollX.value = withTiming(scrollToX, { duration: 150 })
    }, [selectedIndex, isReady, measurements, contentBounds.maxScroll, scrollValue, targetScrollX])

    const handleChipLayout = useCallback((event: LayoutChangeEvent, index: number) => {
        const { x, width, height } = event.nativeEvent.layout

        setMeasurements(prev => {
            if (prev.chipPositions[index] === x && prev.chipWidths[index] === width) {
                return prev
            }

            const newPositions = [...prev.chipPositions]
            const newWidths = [...prev.chipWidths]
            const newHeights = [...prev.chipHeights]
            newPositions[index] = x
            newWidths[index] = width
            newHeights[index] = height

            return {
                ...prev,
                chipPositions: newPositions,
                chipWidths: newWidths,
                chipHeights: newHeights,
            }
        })
    }, [])

    const handleScrollViewLayout = useCallback((event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout
        setMeasurements(prev => (prev.scrollViewWidth === width ? prev : { ...prev, scrollViewWidth: width }))
    }, [])

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollOffset.value = event.nativeEvent.contentOffset.x
        },
        [scrollOffset],
    )

    const indicatorAnimatedStyle = useAnimatedStyle(() => {
        if (!isReady) {
            return {
                width: 0,
                height: 0,
                top: 0,
                transform: [{ translateX: 0 }],
            }
        }

        const width = interpolate(
            scrollValue.value,
            items.map((_, index) => index),
            measurements.chipWidths,
            Extrapolation.CLAMP,
        )

        const height = interpolate(
            scrollValue.value,
            items.map((_, index) => index),
            measurements.chipHeights,
            Extrapolation.CLAMP,
        )

        const translateX =
            interpolate(
                scrollValue.value,
                items.map((_, index) => index),
                measurements.chipPositions,
                Extrapolation.CLAMP,
            ) - scrollOffset.value

        return {
            width,
            height,
            top: 0,
            transform: [{ translateX }],
        }
    }, [isReady, items, measurements.chipWidths, measurements.chipPositions, measurements.chipHeights, size])

    return {
        scrollViewRef,
        handleChipLayout,
        handleScrollViewLayout,
        handleScroll,
        indicatorAnimatedStyle,
        isReady,
    }
}
