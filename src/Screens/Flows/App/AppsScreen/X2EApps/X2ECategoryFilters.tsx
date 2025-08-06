import React, { useMemo } from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseChip, BaseView } from "~Components"
import { useX2ECategories } from "./X2ECategories"
import { X2ECategoryType } from "~Model/DApp"

interface X2ECategoryFiltersProps {
    selectedCategory: {
        id: X2ECategoryType
    }
    onCategoryChange: (category: any) => void
}

export const X2ECategoryFilters = React.memo(({ selectedCategory, onCategoryChange }: X2ECategoryFiltersProps) => {
    const categories = useX2ECategories()

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

    return (
        <BaseView style={styles.filtersContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScrollContainer}>
                {filterOptions.map(({ key, isSelected, title, onPress }) => (
                    <BaseView key={key} mx={6}>
                        <BaseChip label={title} active={isSelected} onPress={onPress} />
                    </BaseView>
                ))}
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
