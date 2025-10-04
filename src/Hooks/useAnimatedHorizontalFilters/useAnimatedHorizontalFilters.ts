import { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutChangeEvent } from "react-native"
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

interface UseAnimatedHorizontalFiltersProps<T> {
    items: T[]
    selectedItem: T
    keyExtractor: (item: T) => string | number
}

export const useAnimatedHorizontalFilters = <T>({
    items,
    selectedItem,
    keyExtractor,
}: UseAnimatedHorizontalFiltersProps<T>) => {
    const scrollViewRef = useAnimatedRef<Animated.ScrollView>()

    const [measurements, setMeasurements] = useState<{
        chipPositions: number[]
        chipWidths: number[]
        scrollViewWidth: number
    }>({
        chipPositions: [],
        chipWidths: [],
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
        () => measurements.chipPositions.length === items.length && measurements.chipWidths.length === items.length,
        [measurements.chipPositions.length, measurements.chipWidths.length, items.length],
    )

    const contentBounds = useMemo(() => {
        if (!isReady) return { totalWidth: 0, maxScroll: 0 }

        const totalWidth = Math.max(...measurements.chipPositions) + Math.max(...measurements.chipWidths) + 20
        const maxScroll = Math.max(0, totalWidth - measurements.scrollViewWidth)

        return { totalWidth, maxScroll }
    }, [isReady, measurements])

    useDerivedValue(() => {
        scrollTo(scrollViewRef, targetScrollX.value, 0, true)
    })

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
        const { x, width } = event.nativeEvent.layout

        setMeasurements(prev => {
            if (prev.chipPositions[index] === x && prev.chipWidths[index] === width) {
                return prev
            }

            const newPositions = [...prev.chipPositions]
            const newWidths = [...prev.chipWidths]
            newPositions[index] = x
            newWidths[index] = width

            return {
                ...prev,
                chipPositions: newPositions,
                chipWidths: newWidths,
            }
        })
    }, [])

    const handleScrollViewLayout = useCallback((event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout
        setMeasurements(prev => (prev.scrollViewWidth === width ? prev : { ...prev, scrollViewWidth: width }))
    }, [])

    const handleScroll = useCallback(
        (event: any) => {
            scrollOffset.value = event.nativeEvent.contentOffset.x
        },
        [scrollOffset],
    )

    const indicatorAnimatedStyle = useAnimatedStyle(() => {
        if (!isReady) {
            return {
                width: 0,
                transform: [{ translateX: 0 }],
            }
        }

        const width = interpolate(
            scrollValue.value,
            items.map((_, index) => index),
            measurements.chipWidths,
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
            transform: [{ translateX }],
        }
    }, [isReady, items, measurements.chipWidths, measurements.chipPositions])

    return {
        scrollViewRef,
        handleChipLayout,
        handleScrollViewLayout,
        handleScroll,
        indicatorAnimatedStyle,
        isReady,
    }
}
