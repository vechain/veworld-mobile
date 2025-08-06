import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { ListRenderItemInfo, StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseSpacer, BaseView, BaseText, BaseIcon } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useI18nContext } from "~i18n"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { useTheme, useDappBookmarking, useAnalyticTracking } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { addNavigationToDApp, useAppDispatch } from "~Storage/Redux"
import { URIUtils } from "~Utils"
import { X2EAppWithDetails } from "./X2EAppWithDetails"
import { X2EAppDetails } from "./X2EAppDetails"
import { X2ECategoryFilters } from "./X2ECategoryFilters"
import { useX2ECategoryFiltering } from "./useX2ECategoryFiltering"
import { useX2ECategories } from "./X2ECategories"
import { X2EAppSkeleton } from "./X2EAppSkeleton"

type X2EDapp = VeBetterDaoDapp & VeBetterDaoDAppMetadata

type X2EAppsListProps = {
    apps: X2EDapp[]
    isLoading: boolean
    onDismiss?: () => void
    openItemId: string | null
    onToggleOpenItem: (itemId: string) => void
}

const X2EAppsList = React.memo(({ apps, isLoading, onDismiss, openItemId, onToggleOpenItem }: X2EAppsListProps) => {
    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<X2EDapp>) => {
            return (
                <X2EAppItem
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

const X2EAppItem = React.memo(
    ({
        dapp,
        onDismiss,
        openItemId,
        onToggleOpenItem,
    }: {
        dapp: X2EDapp
        onDismiss?: () => void
        openItemId: string | null
        onToggleOpenItem: (itemId: string) => void
    }) => {
        const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.external_url, dapp.name)
        const nav = useNavigation()
        const track = useAnalyticTracking()
        const dispatch = useAppDispatch()
        const { LL } = useI18nContext()

        const logoUrl = useMemo(() => {
            return URIUtils.convertUriToUrl(dapp.logo)
        }, [dapp.logo])

        const handleOpen = useCallback(() => {
            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: dapp.external_url,
            })

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: dapp.external_url, isCustom: false }))
            }, 1000)

            nav.navigate(Routes.BROWSER, { url: dapp.external_url })
            onDismiss?.()
        }, [dapp.external_url, nav, track, dispatch, onDismiss])

        const allCategories = useX2ECategories()

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

        const isOpen = openItemId === dapp.id

        return (
            <X2EAppWithDetails
                name={dapp.name}
                icon={logoUrl}
                desc={dapp.description}
                categories={categoryDisplayNames}
                isFavorite={isBookMarked}
                onToggleFavorite={toggleBookmark}
                itemId={dapp.id}
                isOpen={isOpen}
                onToggleOpen={onToggleOpenItem}>
                <X2EAppDetails.Container>
                    <X2EAppDetails.Description>{dapp.description}</X2EAppDetails.Description>
                    <X2EAppDetails.Stats />
                    <X2EAppDetails.Actions
                        onAddToFavorites={toggleBookmark}
                        isFavorite={isBookMarked}
                        onOpen={handleOpen}
                    />
                </X2EAppDetails.Container>
            </X2EAppWithDetails>
        )
    },
)

const styles = StyleSheet.create({
    flatListPadding: { paddingBottom: 24, paddingTop: 32, paddingHorizontal: 24 },
})

type X2EAppsBottomSheetProps = {
    onDismiss?: () => void
}

export const X2EAppsBottomSheet = forwardRef<BottomSheetModalMethods, X2EAppsBottomSheetProps>(({ onDismiss }, ref) => {
    const theme = useTheme()
    const [openItemId, setOpenItemId] = useState<string | null>(null)

    const { selectedCategory, setSelectedCategory, filteredApps, isLoading } = useX2ECategoryFiltering()

    const handleToggleOpenItem = useCallback((itemId: string) => {
        setOpenItemId(prevId => (prevId === itemId ? null : itemId))
    }, [])

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
                        {selectedCategory.displayName}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={32} />
                <X2ECategoryFilters selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
            </BaseView>
            <X2EAppsList
                apps={filteredApps}
                isLoading={isLoading}
                onDismiss={onDismiss}
                openItemId={openItemId}
                onToggleOpenItem={handleToggleOpenItem}
            />
        </BaseBottomSheet>
    )
})
