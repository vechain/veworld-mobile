import { default as React, useCallback } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useAnimatedHorizontalFilters, useThemedStyles } from "~Hooks"
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

    const selectedCategoryObject = categories.find(cat => cat.id === selectedCategory.id) || categories[0]

    const { scrollViewRef, handleChipLayout, handleScrollViewLayout, handleScroll, indicatorAnimatedStyle } =
        useAnimatedHorizontalFilters({
            items: categories,
            selectedItem: selectedCategoryObject,
            keyExtractor: (item: { id: X2ECategoryType; displayName: string; icon: IconKey }) => item.id,
        })

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
