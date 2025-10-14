import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useAnimatedHorizontalFilters, useThemedStyles } from "~Hooks"

export const ActivityTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const { styles, theme } = useThemedStyles(baseStyle)

    const { scrollViewRef, handleChipLayout, handleScrollViewLayout, handleScroll, indicatorAnimatedStyle } =
        useAnimatedHorizontalFilters({
            items: state.routes,
            selectedItem: state.routes[state.index],
            keyExtractor: (item: (typeof state.routes)[0]) => item.key,
        })

    const textColor = useCallback(
        (filter: (typeof state.routes)[0]) => {
            const active = state.routes[state.index].key === filter.key
            if (active) {
                return theme.isDark ? COLORS.PURPLE : COLORS.WHITE
            }
            return theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600
        },
        [state, theme.isDark],
    )

    return (
        <BaseView>
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
                contentContainerStyle={styles.filterContainer}
                showsHorizontalScrollIndicator={false}
                onLayout={handleScrollViewLayout}
                onScroll={handleScroll}
                scrollEventThrottle={16}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key]
                    const label = options?.title ?? route.name

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

                    return (
                        <BaseView
                            key={route.key}
                            onLayout={event => handleChipLayout(event, index)}
                            style={styles.chipWrapper}>
                            <BaseTouchable style={styles.transparentChip} onPress={onPress} activeOpacity={0.8}>
                                <BaseText style={{ color: textColor(route) }} typographyFont="bodyMedium">
                                    {label}
                                </BaseText>
                            </BaseTouchable>
                        </BaseView>
                    )
                })}
            </Animated.ScrollView>
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        rootContainer: {
            minWidth: 64,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            alignItems: "center",
            position: "relative",
        },
        filterContainer: {
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
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
