import React, { useCallback, useMemo } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { CHIP_PADDING, useAnimatedHorizontalFilters } from "~Hooks/useAnimatedHorizontalFilters"

type Props<T> = {
    items: T[]
    selectedItem: T
    keyExtractor: (item: T) => string | number
    getItemLabel: (item: T) => string
    onItemPress: (item: T, index: number) => void
    containerStyle?: Omit<StyleProp<ViewStyle>, "height" | "padding" | "paddingHorizontal" | "paddingVertical">
    contentContainerStyle?: Omit<StyleProp<ViewStyle>, "padding" | "paddingVertical" | "paddingTop" | "paddingBottom">
    chipStyle?: StyleProp<ViewStyle>
    size?: "sm" | "md"
    scrollEnabled?: boolean
    indicatorBackgroundColor?: string
    activeTextColor?: string
    inactiveTextColor?: string
}

export const AnimatedFilterChips = <T,>({
    items,
    selectedItem,
    keyExtractor,
    getItemLabel,
    onItemPress,
    containerStyle,
    contentContainerStyle,
    chipStyle,
    size = "md",
    scrollEnabled = true,
    indicatorBackgroundColor,
    activeTextColor,
    inactiveTextColor,
}: Props<T>) => {
    const { styles, theme } = useThemedStyles(baseStyle(size))

    const { scrollViewRef, handleChipLayout, handleScrollViewLayout, handleScroll, indicatorAnimatedStyle } =
        useAnimatedHorizontalFilters({
            items,
            selectedItem,
            keyExtractor,
            size,
        })

    const textColor = useCallback(
        (item: T) => {
            const active = item === selectedItem
            if (active) {
                return activeTextColor ?? (theme.isDark ? COLORS.PURPLE : COLORS.WHITE)
            }
            return inactiveTextColor ?? (theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600)
        },
        [selectedItem, theme.isDark, activeTextColor, inactiveTextColor],
    )

    const indicatorBackground = useMemo(() => {
        if (indicatorBackgroundColor) return indicatorBackgroundColor
        return theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
    }, [indicatorBackgroundColor, theme.isDark])

    return (
        <BaseView style={[styles.rootContainer, containerStyle]}>
            <Animated.View
                style={[
                    styles.animatedBackground,
                    {
                        backgroundColor: indicatorBackground,
                    },
                    indicatorAnimatedStyle,
                ]}
            />
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                contentContainerStyle={[styles.filterContainer, contentContainerStyle]}
                showsHorizontalScrollIndicator={false}
                onLayout={handleScrollViewLayout}
                onScroll={handleScroll}
                scrollEnabled={scrollEnabled}
                scrollEventThrottle={16}>
                {items.map((item, index) => {
                    const key = keyExtractor(item)
                    return (
                        <BaseView
                            key={key}
                            onLayout={event => handleChipLayout(event, index)}
                            style={[styles.chipWrapper, chipStyle]}>
                            <BaseTouchable
                                testID={`AnimatedFilterChips-${key}`}
                                style={styles.transparentChip}
                                onPress={() => onItemPress(item, index)}
                                activeOpacity={0.8}>
                                <BaseText
                                    style={{ color: textColor(item) }}
                                    typographyFont={size === "sm" ? "captionMedium" : "bodyMedium"}>
                                    {getItemLabel(item)}
                                </BaseText>
                            </BaseTouchable>
                        </BaseView>
                    )
                })}
            </Animated.ScrollView>
        </BaseView>
    )
}

const baseStyle = (size: "sm" | "md") => () =>
    StyleSheet.create({
        rootContainer: {
            position: "relative",
        },
        filterContainer: {
            flexDirection: "row",
            gap: 12,
        },
        chipWrapper: {
            position: "relative",
        },
        transparentChip: {
            minWidth: CHIP_PADDING[size].minWidth,
            paddingHorizontal: 12,
            paddingVertical: CHIP_PADDING[size].paddingVertical,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
        },
        animatedBackground: {
            position: "absolute",
            borderRadius: 20,
            transformOrigin: "center",
        },
    })
