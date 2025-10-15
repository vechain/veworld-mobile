import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import React, { useState, useCallback } from "react"
import { Animated, StyleSheet, LayoutChangeEvent, ScrollView } from "react-native"
import { BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const OldActivityTabBar = ({ state, descriptors, navigation, position }: MaterialTopTabBarProps) => {
    const { styles, theme } = useThemedStyles(baseStyle)

    const [measurements, setMeasurements] = useState<{
        positions: number[]
        widths: number[]
    }>({
        positions: [],
        widths: [],
    })

    const [scrollOffset, setScrollOffset] = useState(0)

    const handleLayout = useCallback((event: LayoutChangeEvent, index: number) => {
        const { x, width } = event.nativeEvent.layout

        setMeasurements(prev => {
            const newPositions = [...prev.positions]
            const newWidths = [...prev.widths]
            newPositions[index] = x
            newWidths[index] = width

            return {
                positions: newPositions,
                widths: newWidths,
            }
        })
    }, [])

    const handleScroll = useCallback((event: any) => {
        setScrollOffset(event.nativeEvent.contentOffset.x)
    }, [])

    // Check if measurements are ready
    const isReady = measurements.positions.length === state.routes.length

    // Use the widest tab as the base width for scaling
    const maxWidth = isReady ? Math.max(...measurements.widths) : 0

    // Calculate scale values for each tab
    const scaleOutputs = isReady ? measurements.widths.map(width => width / maxWidth) : []

    // Interpolate scale
    const indicatorScale = isReady
        ? position.interpolate({
              inputRange: state.routes.map((_, i) => i),
              outputRange: scaleOutputs,
          })
        : 1

    // Calculate translateX considering the scaling AND scroll offset
    const translateXOutputs = isReady
        ? measurements.positions.map((pos, i) => {
              const scaleDiff = (maxWidth - measurements.widths[i]) / 2
              return pos + scaleDiff
          })
        : []

    const indicatorTranslateX = isReady
        ? position.interpolate({
              inputRange: state.routes.map((_, i) => i),
              outputRange: translateXOutputs,
          })
        : 0

    return (
        <BaseView style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={18}
                onScroll={handleScroll}
                contentContainerStyle={styles.scrollContent}>
                {/* Animated Background Indicator */}
                {isReady && (
                    <Animated.View
                        style={[
                            styles.indicator,
                            {
                                backgroundColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
                                width: maxWidth,
                                transform: [
                                    { translateX: Animated.subtract(indicatorTranslateX, scrollOffset) },
                                    { scaleX: indicatorScale },
                                ],
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
                                    activeOpacity={0.8}>
                                    <Animated.Text style={[styles.label, { color: textColor }]}>
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

const baseStyle = () =>
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
            height: 36,
            borderRadius: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: "500",
        },
    })
