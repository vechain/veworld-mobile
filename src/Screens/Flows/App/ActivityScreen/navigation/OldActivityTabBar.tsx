import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import React, { useState, useCallback, useRef, useMemo } from "react"
import { Animated, StyleSheet, LayoutChangeEvent, ScrollView } from "react-native"
import { BaseTouchable, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const OldActivityTabBar = ({ state, descriptors, navigation, position }: MaterialTopTabBarProps) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const scrollViewRef = useRef<ScrollView>(null)

    const [measurements, setMeasurements] = useState<{
        positions: number[]
        widths: number[]
        heights: number[]
    }>({
        positions: [],
        widths: [],
        heights: [],
    })

    const handleLayout = useCallback((event: LayoutChangeEvent, index: number) => {
        const { x, width, height } = event.nativeEvent.layout
        setMeasurements(prev => {
            const newPositions = [...prev.positions]
            const newWidths = [...prev.widths]
            const newHeights = [...prev.heights]
            newPositions[index] = x
            newWidths[index] = width
            newHeights[index] = height

            return {
                positions: newPositions,
                widths: newWidths,
                heights: newHeights,
            }
        })
    }, [])

    // Check if measurements are ready
    const isReady = measurements.positions.length === state.routes.length

    // Calculate translateX considering the scaling AND scroll offset
    const translateXOutputs = useMemo(
        () =>
            isReady
                ? measurements.positions.map(pos => {
                      return pos + 16
                  })
                : [],
        [isReady, measurements.positions],
    )

    const indicatorTranslateX = useMemo(
        () =>
            isReady
                ? position.interpolate({
                      inputRange: state.routes.map((_, i) => i),
                      outputRange: translateXOutputs,
                      extrapolate: "clamp",
                  })
                : 0,
        [isReady, position, state.routes, translateXOutputs],
    )

    return (
        <BaseView style={styles.wrapper}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}>
                {/* Animated Background Indicator */}
                {isReady && (
                    <Animated.View
                        style={[
                            styles.indicator,
                            {
                                width: measurements.widths[state.index],
                                height: measurements.heights[state.index],
                                transform: [{ translateX: indicatorTranslateX }],
                            },
                        ]}
                    />
                )}

                {/* Tab Buttons */}
                <BaseView style={styles.tabsContainer}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key]
                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                ? options.title
                                : route.name

                        const isFocused = state.index === index

                        const onPress = () => {
                            const event = navigation.emit({
                                type: "tabPress",
                                target: route.key,
                                canPreventDefault: true,
                            })

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name, route.params)
                                // scrollViewRef.current?.scrollTo({
                                //     x: index * 64,
                                //     y: 0,
                                //     animated: true,
                                // })
                            }
                        }

                        // Animate text color based on position
                        const inputRange = state.routes.map((_, i) => i)
                        const colorOutputRange = state.routes.map(() => {
                            if (isFocused) {
                                return theme.isDark ? COLORS.PURPLE : COLORS.WHITE
                            }
                            return theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600
                        })

                        const textColor = position.interpolate({
                            inputRange,
                            outputRange: colorOutputRange,
                            extrapolate: "clamp",
                        })

                        return (
                            <BaseView
                                key={route.key}
                                onLayout={event => handleLayout(event, index)}
                                style={styles.chipWrapper}>
                                <BaseTouchable
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                    accessibilityLabel={options.tabBarAccessibilityLabel}
                                    onPress={onPress}
                                    style={styles.chip}
                                    activeOpacity={1}>
                                    <Animated.Text
                                        style={[
                                            styles.label,
                                            { color: textColor, backgroundColor: isFocused ? "red" : "transparent" },
                                        ]}>
                                        {typeof label === "function"
                                            ? label({ focused: isFocused, color: COLORS.WHITE, children: "" })
                                            : label}
                                    </Animated.Text>
                                </BaseTouchable>
                            </BaseView>
                        )
                    })}
                </BaseView>
            </ScrollView>
        </BaseView>
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        wrapper: {
            paddingTop: 16,
            paddingBottom: 24,
        },
        scrollContent: {
            paddingHorizontal: 16,
            position: "relative",
        },
        tabsContainer: {
            flexDirection: "row",
            gap: 12,
        },
        chipWrapper: {
            position: "relative",
        },
        chip: {
            minWidth: 64,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
        },
        indicator: {
            position: "absolute",
            top: 0,
            borderRadius: 20,
            backgroundColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
        },
        label: {
            fontSize: 14,
            fontWeight: "500",
        },
    })
