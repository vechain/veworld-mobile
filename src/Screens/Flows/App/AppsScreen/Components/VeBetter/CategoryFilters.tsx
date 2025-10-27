import React from "react"
import { StyleSheet } from "react-native"
import { AnimatedFilterChips } from "~Components"
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
    const { styles } = useThemedStyles(baseStyles)

    const selectedCategoryObject = categories.find(cat => cat.id === selectedCategory.id) || categories[0]
    return (
        <AnimatedFilterChips
            containerStyle={styles.root}
            contentContainerStyle={styles.filterContainer}
            items={categories}
            selectedItem={selectedCategoryObject}
            keyExtractor={item => item.id}
            getItemLabel={item => item.displayName}
            onItemPress={onCategoryChange}
        />
    )
})

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: 64,
        },
        filterContainer: {
            paddingHorizontal: 16,
        },
    })
