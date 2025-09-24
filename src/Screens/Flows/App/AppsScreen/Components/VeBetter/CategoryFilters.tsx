import React, { useMemo, useRef, useEffect, useCallback } from "react"
import { StyleSheet } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { BaseChip, BaseView } from "~Components"
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
    const scrollViewRef = useRef<ScrollView>(null)
    const hasScrolledRef = useRef(false)

    const filterOptions = useMemo(() => {
        return categories.map(category => {
            return {
                key: category.id,
                title: category.displayName,
                isSelected: selectedCategory.id === category.id,
                onPress: () => onCategoryChange(category),
            }
        })
    }, [selectedCategory.id, categories, onCategoryChange])

    const filterChips = useMemo(() => {
        return filterOptions.map(({ key, isSelected, title, onPress }) => (
            <BaseView key={key} mx={6}>
                <BaseChip label={title} active={isSelected} onPress={onPress} />
            </BaseView>
        ))
    }, [filterOptions])

    const scrollToSelectedCategory = useCallback(() => {
        const selectedIndex = categories.findIndex(cat => cat.id === selectedCategory.id)
        if (selectedIndex !== -1 && scrollViewRef.current && !hasScrolledRef.current) {
            const chipWidth = 110
            const scrollPosition = Math.max(0, selectedIndex * chipWidth - 100)

            scrollViewRef.current.scrollTo({
                x: scrollPosition,
                animated: false,
            })
            hasScrolledRef.current = true
        }
    }, [selectedCategory.id, categories])

    useEffect(() => {
        hasScrolledRef.current = false
    }, [selectedCategory.id])

    return (
        <BaseView style={styles.filtersContainer}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScrollContainer}
                onLayout={scrollToSelectedCategory}>
                {filterChips}
            </ScrollView>
        </BaseView>
    )
})

const styles = StyleSheet.create({
    filtersContainer: {
        height: 48,
    },
    filtersScrollContainer: {
        paddingHorizontal: 16,
        alignItems: "center",
    },
})
