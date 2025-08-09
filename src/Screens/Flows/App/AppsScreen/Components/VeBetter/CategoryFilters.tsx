import React, { useMemo } from "react"
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

    return (
        <BaseView style={styles.filtersContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScrollContainer}>
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
