import React from "react"
import { StyleSheet } from "react-native"
import { AnimatedFilterChips } from "~Components"
import { useThemedStyles } from "~Hooks"
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
    const { styles } = useThemedStyles(baseStyles)

    return (
        <AnimatedFilterChips
            containerStyle={styles.root}
            contentContainerStyle={styles.filterContainer}
            items={FILTERS}
            selectedItem={selectedFilter}
            keyExtractor={item => item}
            getItemLabel={item => LL[`DISCOVER_ECOSYSTEM_FILTER_${StringUtils.toUppercase(item)}`]()}
            onItemPress={onPress}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            position: "relative",
            marginVertical: 8,
        },
        filterContainer: {
            gap: 4,
        },
    })
