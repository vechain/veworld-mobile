import { default as React, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Extrapolation,
} from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { StringUtils } from "~Utils"
import { DappTypeV2 } from "./types"

type Props = {
    selectedFilter: DappTypeV2
    onPress: (value: DappTypeV2) => void
}

const FILTERS = Object.values(DappTypeV2)

export const FiltersSection = ({ selectedFilter, onPress }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const textColor = useCallback(
        (filter: DappTypeV2) => {
            const active = selectedFilter === filter
            if (active) {
                return theme.isDark ? COLORS.PURPLE : COLORS.WHITE
            }
            return theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600
        },
        [selectedFilter, theme.isDark],
    )

    const scrollViewRef = useRef<ScrollView>(null)

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

    const selectedIndex = useMemo(() => FILTERS.findIndex(filter => filter === selectedFilter), [selectedFilter])

    const isReady = useMemo(
        () => measurements.chipPositions.length === FILTERS.length && measurements.chipWidths.length === FILTERS.length,
        [measurements.chipPositions.length, measurements.chipWidths.length],
    )

    const contentBounds = useMemo(() => {
        if (!isReady) return { totalWidth: 0, maxScroll: 0 }

        const totalWidth = Math.max(...measurements.chipPositions) + Math.max(...measurements.chipWidths) + 20
        const maxScroll = Math.max(0, totalWidth - measurements.scrollViewWidth)

        return { totalWidth, maxScroll }
    }, [isReady, measurements])

    useEffect(() => {
        if (selectedIndex < 0 || !isReady) return

        scrollValue.value = withTiming(selectedIndex, { duration: 150 })

        const chipPosition = measurements.chipPositions[selectedIndex]
        const chipWidth = measurements.chipWidths[selectedIndex]
        const chipCenter = chipPosition + chipWidth / 2
        const viewportCenter = measurements.scrollViewWidth / 2

        let scrollTo = chipCenter - viewportCenter
        scrollTo = Math.max(0, Math.min(scrollTo, contentBounds.maxScroll))

        scrollViewRef.current?.scrollTo({
            x: scrollTo,
            animated: true,
        })
    }, [selectedIndex, isReady, measurements, contentBounds.maxScroll, scrollValue])

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
            FILTERS.map((_, index) => index),
            measurements.chipWidths,
            Extrapolation.CLAMP,
        )

        const translateX =
            interpolate(
                scrollValue.value,
                FILTERS.map((_, index) => index),
                measurements.chipPositions,
                Extrapolation.CLAMP,
            ) - scrollOffset.value

        return {
            width,
            transform: [{ translateX }],
        }
    }, [isReady])

    return (
        <BaseView style={styles.container}>
            <Animated.View
                style={[
                    styles.animatedBackground,
                    {
                        backgroundColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
                    },
                    indicatorAnimatedStyle,
                ]}
            />

            <ScrollView
                ref={scrollViewRef}
                horizontal
                contentContainerStyle={styles.root}
                showsHorizontalScrollIndicator={false}
                onLayout={handleScrollViewLayout}
                onScroll={handleScroll}
                scrollEventThrottle={16}>
                {FILTERS.map((filter, index) => (
                    <BaseView
                        key={filter}
                        onLayout={event => handleChipLayout(event, index)}
                        style={styles.chipWrapper}>
                        <BaseTouchable
                            style={styles.transparentChip}
                            onPress={onPress.bind(null, filter)}
                            activeOpacity={0.8}>
                            <BaseText style={{ color: textColor(filter) }} typographyFont="bodyMedium">
                                {LL[`DISCOVER_ECOSYSTEM_FILTER_${StringUtils.toUppercase(filter)}`]()}
                            </BaseText>
                        </BaseTouchable>
                    </BaseView>
                ))}
            </ScrollView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            position: "relative",
        },
        root: {
            gap: 0,
            paddingVertical: 8,
        },
        chipWrapper: {
            position: "relative",
        },
        transparentChip: {
            minWidth: 64,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            alignItems: "center",
        },
        animatedBackground: {
            position: "absolute",
            top: 8,
            height: 36,
            borderRadius: 20,
        },
    })
