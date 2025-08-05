import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, ScrollView, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseChip, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { X2ECategory, X2ECategoryType, VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { useTheme, useVeBetterDaoDapps } from "~Hooks"
import { URIUtils } from "~Utils"
import { X2EAppWithDetails } from "./X2EAppWithDetails"
import { X2EAppDetails } from "./X2EAppDetails"
import { SortableKeys } from "../../DiscoverScreen/Components/Bottomsheets"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

type X2EDapp = VeBetterDaoDapp & VeBetterDaoDAppMetadata

type Filter = {
    key: X2ECategoryType
    title: string
    isSelected: boolean
    onPress: () => void
}

type TopFiltersProps = {
    filters: Filter[]
}

const TopFilters = ({ filters }: TopFiltersProps) => {
    return (
        <BaseView style={styles.filtersContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScrollContainer}>
                {filters.map(({ key, isSelected, title, onPress }) => (
                    <BaseView key={key} mx={6}>
                        <BaseChip label={title} active={isSelected} onPress={onPress} />
                    </BaseView>
                ))}
            </ScrollView>
        </BaseView>
    )
}

type X2EListProps = {
    apps: X2EDapp[]
    isLoading: boolean
}

const X2EAppItem = React.memo(({ dapp }: { dapp: X2EDapp }) => {
    const logoUrl = useMemo(() => {
        return URIUtils.convertUriToUrl(dapp.logo)
    }, [dapp.logo])

    return (
        <X2EAppWithDetails name={dapp.name} icon={logoUrl} desc={dapp.description}>
            <X2EAppDetails.Container>
                <X2EAppDetails.Description>{dapp.description}</X2EAppDetails.Description>
                <X2EAppDetails.Stats />
                <BaseSpacer height={8} />
                <X2EAppDetails.Actions />
            </X2EAppDetails.Container>
        </X2EAppWithDetails>
    )
})

const X2EAppsList = React.memo(({ apps, isLoading }: X2EListProps) => {
    const renderItem = useCallback(({ item }: ListRenderItemInfo<X2EDapp>) => {
        return <X2EAppItem dapp={item} />
    }, [])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const renderSkeletonItem = useCallback(() => {
        return <BaseView bg={COLORS.GREY_200} h={100} borderRadius={12} />
    }, [])

    const keyExtractor = useCallback((item: X2EDapp) => item.id, [])

    if (isLoading && apps.length === 0) {
        return (
            <FlatList
                renderItem={renderSkeletonItem}
                data={[1, 2, 3, 4, 5]}
                keyExtractor={item => item.toString()}
                scrollEnabled={false}
                shouldRasterizeIOS
                ItemSeparatorComponent={renderItemSeparator}
                contentContainerStyle={styles.flatListPadding}
            />
        )
    }

    return (
        <FlatList
            data={apps}
            scrollEnabled={true}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.flatListPadding}
            ItemSeparatorComponent={renderItemSeparator}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            onEndReachedThreshold={0.5}
        />
    )
})

const styles = StyleSheet.create({
    flatListPadding: { paddingBottom: 24, paddingTop: 32, paddingHorizontal: 24 },
    filtersContainer: {
        height: 48,
    },
    filtersScrollContainer: {
        paddingHorizontal: 16,
        alignItems: "center",
    },
})

type X2EAppsBottomSheetProps = {
    onDismiss?: () => void
    sortedBy?: SortableKeys
    onSortChange?: (sort: SortableKeys) => void
}

export const X2EAppsBottomSheet = forwardRef<BottomSheetModalMethods, X2EAppsBottomSheetProps>(
    ({ onDismiss, sortedBy = "asc" }, ref) => {
        const theme = useTheme()

        const [selectedCategory, setSelectedCategory] = useState(() => X2ECategory.RENEWABLE_ENERGY_EFFICIENCY)

        const { data: allApps, isLoading } = useVeBetterDaoDapps()
        const dappsToShow = useMemo(() => {
            if (!allApps) return []

            // Filter by category
            const filtered = allApps.filter(dapp => dapp.categories?.includes(selectedCategory.id) || false)

            // Sort
            return [...filtered].sort((a, b) => {
                switch (sortedBy) {
                    case "asc":
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                    case "desc":
                        return b.name.toLowerCase().localeCompare(a.name.toLowerCase())
                    case "newest":
                        return parseInt(b.createdAtTimestamp) - parseInt(a.createdAtTimestamp)
                    default:
                        return 0
                }
            })
        }, [allApps, selectedCategory.id, sortedBy])

        const filterOptions = useMemo(() => {
            const categoriesToShow = Object.values(X2ECategory)

            return categoriesToShow
                .map(category => ({
                    key: category.id,
                    title: category.displayName,
                    isSelected: selectedCategory.id === category.id,
                    onPress: () => setSelectedCategory(category),
                }))
                .sort((a, b) => a.title.localeCompare(b.title))
        }, [selectedCategory.id])

        return (
            <BaseBottomSheet
                snapPoints={["93%"]}
                ref={ref}
                onDismiss={onDismiss}
                floating={false}
                noMargins={true}
                backgroundStyle={{ backgroundColor: theme.colors.card }}>
                <BaseView pb={16} py={18}>
                    <BaseView flexDirection="row" gap={16} alignItems="center" px={24}>
                        <BaseIcon name={selectedCategory.icon} size={32} color={theme.colors.editSpeedBs.title} />
                        <BaseView flex={1}>
                            <BaseText typographyFont="biggerTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                                {selectedCategory.displayName}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={32} />
                    <TopFilters filters={filterOptions} />
                    <X2EAppsList apps={dappsToShow || []} isLoading={isLoading} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
