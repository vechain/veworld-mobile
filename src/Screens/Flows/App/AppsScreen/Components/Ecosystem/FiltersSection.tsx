import { default as React } from "react"
import { StyleSheet } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { BaseChip } from "~Components"
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
        <ScrollView horizontal contentContainerStyle={styles.root} showsHorizontalScrollIndicator={false}>
            {FILTERS.map(filter => (
                <BaseChip
                    key={filter}
                    label={LL[`DISCOVER_ECOSYSTEM_FILTER_${StringUtils.toUppercase(filter)}`]()}
                    active={selectedFilter === filter}
                    onPress={onPress.bind(null, filter)}
                />
            ))}
        </ScrollView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            gap: 12,
            paddingVertical: 8,
        },
    })
