import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useAnimatedHorizontalFilters, useThemedStyles } from "~Hooks"
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

    const { scrollViewRef, handleChipLayout, handleScrollViewLayout, handleScroll, indicatorAnimatedStyle } =
        useAnimatedHorizontalFilters({
            items: FILTERS,
            selectedItem: selectedFilter,
            keyExtractor: (item: DappTypeV2) => item,
        })

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
            </Animated.ScrollView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            position: "relative",
        },
        root: {
            gap: 4,
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
