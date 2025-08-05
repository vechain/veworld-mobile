import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { ListRenderItemInfo, ScrollView, StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseChip, BaseIcon, BaseSpacer, BaseText, BaseView, BaseSkeleton } from "~Components"
import { X2ECategory, X2ECategoryType, VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { useTheme, useVeBetterDaoDapps } from "~Hooks"
import { URIUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { X2EAppWithDetails } from "./X2EAppWithDetails"
import { X2EAppDetails } from "./X2EAppDetails"

type X2EDapp = VeBetterDaoDapp & VeBetterDaoDAppMetadata

type Filter = {
    key: X2ECategoryType
    title: string
    isSelected: boolean
    onPress: () => void
}

// Helper function to get localized category key (returns the key, not the translated value)
const getCategoryLocalizationKey = (categoryId: X2ECategoryType) => {
    switch (categoryId) {
        case X2ECategoryType.OTHERS:
            return "APP_CATEGORY_OTHERS"
        case X2ECategoryType.EDUCATION_LEARNING:
            return "APP_CATEGORY_LEARNING"
        case X2ECategoryType.FITNESS_WELLNESS:
            return "APP_CATEGORY_LIFESTYLE"
        case X2ECategoryType.GREEN_FINANCE_DEFI:
            return "APP_CATEGORY_WEB3"
        case X2ECategoryType.GREEN_MOBILITY_TRAVEL:
            return "APP_CATEGORY_TRANSPORTATION"
        case X2ECategoryType.NUTRITION:
            return "APP_CATEGORY_FOOD_AND_DRINK"
        case X2ECategoryType.PLASTIC_WASTE_RECYCLING:
            return "APP_CATEGORY_RECYCLING"
        case X2ECategoryType.RENEWABLE_ENERGY_EFFICIENCY:
            return "APP_CATEGORY_ENERGY"
        case X2ECategoryType.SUSTAINABLE_SHOPPING:
            return "APP_CATEGORY_SHOPPING"
        case X2ECategoryType.PETS:
            return "APP_CATEGORY_PETS"
        default:
            return "APP_CATEGORY_OTHERS"
    }
}

type TopFiltersProps = {
    filters: Filter[]
}

const TopFilters = React.memo(({ filters }: TopFiltersProps) => {
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
})

const X2EAppSkeleton = React.memo(() => {
    const theme = useTheme()

    return (
        <BaseSkeleton
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 24,
                    children: [
                        { width: 64, height: 64, borderRadius: 8 },
                        {
                            flexDirection: "column",
                            gap: 8,
                            flex: 1,
                            children: [
                                { width: "70%", height: 17, borderRadius: 4 },
                                { width: "90%", height: 14, borderRadius: 4 },
                            ],
                        },
                    ],
                },
            ]}
        />
    )
})

type X2EAppsListProps = {
    apps: X2EDapp[]
    isLoading: boolean
}

const X2EAppsList = React.memo(({ apps, isLoading }: X2EAppsListProps) => {
    const renderItem = useCallback(({ item }: ListRenderItemInfo<X2EDapp>) => {
        return <X2EAppItem dapp={item} />
    }, [])

    const renderSkeletonItem = useCallback(() => {
        return <X2EAppSkeleton />
    }, [])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const keyExtractor = useCallback((item: X2EDapp) => item.id, [])

    if (isLoading) {
        return (
            <BottomSheetFlatList
                data={[1, 2, 3, 4, 5, 6]}
                keyExtractor={item => item.toString()}
                renderItem={renderSkeletonItem}
                ItemSeparatorComponent={renderItemSeparator}
                scrollEnabled={false}
                contentContainerStyle={styles.flatListPadding}
            />
        )
    }

    return (
        <BottomSheetFlatList
            data={apps}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={renderItemSeparator}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.flatListPadding}
        />
    )
})

const X2EAppItem = React.memo(({ dapp }: { dapp: X2EDapp }) => {
    const { LL } = useI18nContext()

    const logoUrl = useMemo(() => {
        return URIUtils.convertUriToUrl(dapp.logo)
    }, [dapp.logo])

    // Get all categories for display, or fallback to OTHERS if none
    const categoryDisplayNames = useMemo(() => {
        if (!dapp.categories || dapp.categories.length === 0) {
            return [LL[getCategoryLocalizationKey(X2ECategoryType.OTHERS)]()]
        }

        return dapp.categories.map(categoryId => LL[getCategoryLocalizationKey(categoryId)]())
    }, [dapp.categories, LL])

    return (
        <X2EAppWithDetails name={dapp.name} icon={logoUrl} desc={dapp.description} categories={categoryDisplayNames}>
            <X2EAppDetails.Container>
                <X2EAppDetails.Description>{dapp.description}</X2EAppDetails.Description>
                <X2EAppDetails.Stats />
                <BaseSpacer height={8} />
                <X2EAppDetails.Actions />
            </X2EAppDetails.Container>
        </X2EAppWithDetails>
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
}

export const X2EAppsBottomSheet = forwardRef<BottomSheetModalMethods, X2EAppsBottomSheetProps>(({ onDismiss }, ref) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const [selectedCategory, setSelectedCategory] = useState(() => X2ECategory.RENEWABLE_ENERGY_EFFICIENCY)

    const { data: allApps, isLoading } = useVeBetterDaoDapps()

    const x2eAppsToShow = useMemo(() => {
        if (!allApps) return []

        const filtered = allApps?.filter(dapp => dapp.categories?.includes(selectedCategory.id) || false)

        return [...filtered].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    }, [allApps, selectedCategory.id])

    const filterOptions = useMemo(() => {
        const categoriesToShow = Object.values(X2ECategory)

        return categoriesToShow
            .map(category => {
                const localizationKey = getCategoryLocalizationKey(category.id)
                return {
                    key: category.id,
                    title: (LL[localizationKey] as () => string)(),
                    isSelected: selectedCategory.id === category.id,
                    onPress: () => setSelectedCategory(category),
                }
            })
            .sort((a, b) => a.title.localeCompare(b.title))
    }, [selectedCategory.id, LL])

    return (
        <BaseBottomSheet
            snapPoints={["93%"]}
            ref={ref}
            onDismiss={onDismiss}
            floating={false}
            noMargins={true}
            backgroundStyle={{ backgroundColor: theme.colors.card }}>
            <BaseView>
                <BaseView flexDirection="row" gap={16} alignItems="center" px={24} mt={16}>
                    <BaseIcon name={selectedCategory.icon} size={32} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="biggerTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL[getCategoryLocalizationKey(selectedCategory.id)]()}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={32} />
                <TopFilters filters={filterOptions} />
            </BaseView>
            <X2EAppsList apps={x2eAppsToShow} isLoading={isLoading} />
        </BaseBottomSheet>
    )
})
