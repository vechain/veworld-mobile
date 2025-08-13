import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSkeleton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { CategoryFilters, RowDetails, RowExpandableDetails } from "~Screens/Flows/App/AppsScreen/Components"
import { useCategories, useCategoryFiltering } from "~Screens/Flows/App/AppsScreen/Components/VeBetter/Hooks"
import { useDAppActions } from "~Screens/Flows/App/AppsScreen/Hooks"
import { URIUtils } from "~Utils"

type X2EDapp = VeBetterDaoDapp & VeBetterDaoDAppMetadata

type X2EAppsListProps = {
    apps: X2EDapp[]
    isLoading?: boolean
    onDismiss?: () => void
    openItemId: string | null
    onToggleOpenItem: (itemId: string) => void
}

type X2EAppItemProps = {
    dapp: X2EDapp
    onDismiss?: () => void
    openItemId: string | null
    onToggleOpenItem: (itemId: string) => void
}

type X2EAppsBottomSheetProps = {
    onDismiss?: () => void
    allApps?: X2EDapp[]
    isLoading: boolean
}

const AppListItem = React.memo(({ dapp, onDismiss, openItemId, onToggleOpenItem }: X2EAppItemProps) => {
    const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.external_url, dapp.name)
    const { onDAppPress } = useDAppActions()
    const { LL } = useI18nContext()

    const allCategories = useCategories()

    const logoUrl = useMemo(() => {
        return URIUtils.convertUriToUrl(dapp.logo)
    }, [dapp.logo])

    const handleOpen = useCallback(async () => {
        const discoveryDApp = {
            id: dapp.id,
            name: dapp.name,
            href: dapp.external_url,
            desc: dapp.description,
            createAt: parseInt(dapp.createdAtTimestamp),
            isCustom: false,
            amountOfNavigations: 0,
            veBetterDaoId: dapp.id,
        }

        await onDAppPress(discoveryDApp)
        onDismiss?.()
    }, [dapp, onDAppPress, onDismiss])

    const categoryDisplayNames = useMemo(() => {
        if (!dapp.categories || dapp.categories.length === 0) {
            const othersCategory = allCategories.find(cat => cat.id === "others")
            return [othersCategory?.displayName ?? LL.APP_CATEGORY_OTHERS()]
        }

        return dapp.categories.map(categoryId => {
            const category = allCategories.find(cat => cat.id === categoryId)
            return category?.displayName ?? LL.APP_CATEGORY_OTHERS()
        })
    }, [dapp.categories, allCategories, LL])

    const isOpen = useMemo(() => openItemId === dapp.id, [openItemId, dapp.id])

    const detailsChildren = useMemo(
        () => (
            <RowExpandableDetails.Container>
                <RowExpandableDetails.Description>{dapp.description}</RowExpandableDetails.Description>
                <RowExpandableDetails.Stats />
                <RowExpandableDetails.Actions
                    onAddToFavorites={toggleBookmark}
                    isFavorite={isBookMarked}
                    onOpen={handleOpen}
                />
            </RowExpandableDetails.Container>
        ),
        [dapp.description, toggleBookmark, isBookMarked, handleOpen],
    )

    return (
        <RowDetails
            name={dapp.name}
            icon={logoUrl}
            desc={dapp.description}
            categories={categoryDisplayNames}
            isFavorite={isBookMarked}
            onToggleFavorite={toggleBookmark}
            itemId={dapp.id}
            isOpen={isOpen}
            onToggleOpen={onToggleOpenItem}>
            {detailsChildren}
        </RowDetails>
    )
})

const AppList = React.memo(({ apps, isLoading, onDismiss, openItemId, onToggleOpenItem }: X2EAppsListProps) => {
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<X2EDapp>) => {
            return (
                <AppListItem
                    dapp={item}
                    onDismiss={onDismiss}
                    openItemId={openItemId}
                    onToggleOpenItem={onToggleOpenItem}
                />
            )
        },
        [onDismiss, openItemId, onToggleOpenItem],
    )

    const renderSkeletonItem = useCallback(() => {
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
    }, [theme.colors.skeletonBoneColor, theme.colors.skeletonHighlightColor])

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

export const AppsBottomSheet = forwardRef<BottomSheetModalMethods, X2EAppsBottomSheetProps>(
    ({ onDismiss, allApps, isLoading }, ref) => {
        const theme = useTheme()
        const [openItemId, setOpenItemId] = useState<string | null>(null)

        const { selectedCategory, setSelectedCategory, filteredApps } = useCategoryFiltering(allApps)

        const handleToggleOpenItem = useCallback((itemId: string) => {
            setOpenItemId(prevId => (prevId === itemId ? null : itemId))
        }, [])

        const headerContent = useMemo(
            () => (
                <BaseView>
                    <BaseView flexDirection="row" gap={16} alignItems="center" px={24} mt={16}>
                        <BaseIcon name={selectedCategory.icon} size={32} color={theme.colors.editSpeedBs.title} />
                        <BaseText typographyFont="biggerTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                            {selectedCategory.displayName}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={32} />
                    <CategoryFilters selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
                </BaseView>
            ),
            [selectedCategory, theme.colors.editSpeedBs.title, setSelectedCategory],
        )

        return (
            <BaseBottomSheet
                snapPoints={["93%"]}
                ref={ref}
                onDismiss={onDismiss}
                floating={false}
                noMargins={true}
                backgroundStyle={{ backgroundColor: theme.colors.card }}>
                {headerContent}
                <AppList
                    apps={filteredApps}
                    isLoading={isLoading}
                    onDismiss={onDismiss}
                    openItemId={openItemId}
                    onToggleOpenItem={handleToggleOpenItem}
                />
            </BaseBottomSheet>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        flatListPadding: { paddingBottom: 24, paddingTop: 32, paddingHorizontal: 24 },
    })
