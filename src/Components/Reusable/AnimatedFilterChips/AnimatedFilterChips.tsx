import React, { useCallback } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { useAnimatedHorizontalFilters, useThemedStyles } from "~Hooks"

type Props<T> = {
    items: T[]
    selectedItem: T
    keyExtractor: (item: T) => string | number
    getItemLabel: (item: T) => string
    onItemPress: (item: T, index: number) => void
    containerStyle?: StyleProp<ViewStyle>
    contentContainerStyle?: StyleProp<ViewStyle>
}

export const AnimatedFilterChips = <T,>({
    items,
    selectedItem,
    keyExtractor,
    getItemLabel,
    onItemPress,
    containerStyle,
    contentContainerStyle,
}: Props<T>) => {
    const { styles, theme } = useThemedStyles(baseStyle)

    const { scrollViewRef, handleChipLayout, handleScrollViewLayout, handleScroll, indicatorAnimatedStyle } =
        useAnimatedHorizontalFilters({
            items,
            selectedItem,
            keyExtractor,
        })

    const textColor = useCallback(
        (item: T) => {
            const active = item === selectedItem
            if (active) {
                return theme.isDark ? COLORS.PURPLE : COLORS.WHITE
            }
            return theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600
        },
        [selectedItem, theme.isDark],
    )

    return (
        <BaseView style={[styles.rootContainer, containerStyle]}>
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
                contentContainerStyle={[styles.filterContainer, contentContainerStyle]}
                showsHorizontalScrollIndicator={false}
                onLayout={handleScrollViewLayout}
                onScroll={handleScroll}
                scrollEventThrottle={16}>
                {items.map((item, index) => (
                    <BaseView key={index} onLayout={event => handleChipLayout(event, index)} style={styles.chipWrapper}>
                        <BaseTouchable
                            testID={`AnimatedFilterChips-${keyExtractor(item)}`}
                            style={styles.transparentChip}
                            onPress={() => onItemPress(item, index)}
                            activeOpacity={0.8}>
                            <BaseText style={{ color: textColor(item) }} typographyFont="bodyMedium">
                                {getItemLabel(item)}
                            </BaseText>
                        </BaseTouchable>
                    </BaseView>
                ))}
            </Animated.ScrollView>
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        rootContainer: {
            position: "relative",
        },
        filterContainer: {
            flexDirection: "row",
            gap: 12,
            paddingTop: 16,
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
            justifyContent: "center",
        },
        animatedBackground: {
            position: "absolute",
            top: 18,
            height: 32,
            borderRadius: 20,
        },
    })
