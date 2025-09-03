import { default as React, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Extrapolation,
    useAnimatedScrollHandler,
} from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { X2ECategoryType } from "~Model/DApp"
import { useCategories } from "./Hooks/useCategories"

interface CategoryFiltersProps {
    selectedCategory: {
        id: X2ECategoryType
    }
    onCategoryChange: (category: { id: X2ECategoryType; displayName: string; icon: IconKey }) => void
}

export const CategoryFilters = React.memo(({ selectedCategory, onCategoryChange }: CategoryFiltersProps) => {
    const categories = useCategories()
    const { styles, theme } = useThemedStyles(baseStyles)

    const textColor = useCallback(
        (category: { id: X2ECategoryType; displayName: string; icon: IconKey }) => {
            const active = selectedCategory.id === category.id
            if (active) {
                return theme.isDark ? COLORS.PURPLE : COLORS.WHITE
            }
            return theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600
        },
        [selectedCategory.id, theme.isDark],
    )

    const scrollViewRef = useRef<Animated.ScrollView>(null)

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

    const selectedIndex = useMemo(
        () => categories.findIndex(category => category.id === selectedCategory.id),
        [selectedCategory.id, categories],
    )

    const isReady = useMemo(
        () =>
            measurements.chipPositions.length === categories.length &&
            measurements.chipWidths.length === categories.length,
        [measurements.chipPositions.length, measurements.chipWidths.length, categories.length],
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

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            "worklet"
            scrollOffset.value = event.contentOffset.x
        },
    })

    const indicatorAnimatedStyle = useAnimatedStyle(() => {
        "worklet"

        if (!isReady) {
            return {
                width: 0,
                transform: [{ translateX: 0 }],
            }
        }

        const width = interpolate(
            scrollValue.value,
            categories.map((_, index) => index),
            measurements.chipWidths,
            Extrapolation.CLAMP,
        )

        const translateX =
            interpolate(
                scrollValue.value,
                categories.map((_, index) => index),
                measurements.chipPositions,
                Extrapolation.CLAMP,
            ) - scrollOffset.value

        return {
            width,
            transform: [{ translateX }],
        }
    }, [isReady, categories, measurements.chipWidths, measurements.chipPositions])

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

            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                contentContainerStyle={styles.root}
                showsHorizontalScrollIndicator={false}
                onLayout={handleScrollViewLayout}
                onScroll={scrollHandler}
                scrollEventThrottle={1}>
                {categories.map((category, index) => (
                    <BaseView
                        key={category.id}
                        onLayout={event => handleChipLayout(event, index)}
                        style={styles.chipWrapper}>
                        <BaseTouchable
                            style={styles.transparentChip}
                            onPress={() => onCategoryChange(category)}
                            activeOpacity={0.8}>
                            <BaseText style={{ color: textColor(category) }} typographyFont="bodyMedium">
                                {category.displayName}
                            </BaseText>
                        </BaseTouchable>
                    </BaseView>
                ))}
            </Animated.ScrollView>
        </BaseView>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        container: {
            position: "relative",
            height: 64,
        },
        root: {
            gap: 4,
            paddingVertical: 8,
            paddingHorizontal: 16,
            alignItems: "center",
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
            top: 14,
            height: 36,
            borderRadius: 20,
        },
    })
