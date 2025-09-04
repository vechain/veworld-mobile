import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from "react"
import { ListRenderItemInfo, StyleSheet, Dimensions } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing, runOnJS } from "react-native-reanimated"
import { BaseBottomSheet, BaseIcon, BaseSkeleton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useBatchAppOverviews, useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
import { useVeBetterDaoActiveDapps } from "~Hooks/useFetchFeaturedDApps/useVeBetterDaoActiveApps"
import { useI18nContext } from "~i18n"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata, X2ECategoryType, IconKey } from "~Model"
import { FetchAppOverviewResponse } from "~Networking/API/Types"
import { CategoryFilters, RowDetails, RowExpandableDetails } from "~Screens/Flows/App/AppsScreen/Components"
import { useCategories, useCategoryFiltering } from "~Screens/Flows/App/AppsScreen/Components/VeBetter/Hooks"
import { useDAppActions } from "~Screens/Flows/App/AppsScreen/Hooks"
import { URIUtils } from "~Utils"

const SCREEN_WIDTH = Dimensions.get("window").width

type X2EDapp = VeBetterDaoDapp & VeBetterDaoDAppMetadata

type X2EAppsListProps = {
    apps: X2EDapp[]
    isLoading?: boolean
    onDismiss?: () => void
    openItemId: string | null
    onToggleOpenItem: (itemId: string) => void
    appOverviews: Record<string, FetchAppOverviewResponse | undefined>
    isOverviewsLoading: boolean
}

type X2EAppItemProps = {
    dapp: X2EDapp
    onDismiss?: () => void
    openItemId: string | null
    onToggleOpenItem: (itemId: string) => void
    appOverview?: FetchAppOverviewResponse
    isOverviewLoading?: boolean
}

type X2EAppsBottomSheetProps = {
    onDismiss?: () => void
    initialCategoryId?: X2ECategoryType
}

const AppListItem = React.memo(
    ({ dapp, onDismiss, openItemId, onToggleOpenItem, appOverview, isOverviewLoading = false }: X2EAppItemProps) => {
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
                createAt: parseInt(dapp.createdAtTimestamp, 10),
                isCustom: false,
                amountOfNavigations: 0,
                veBetterDaoId: dapp.id,
                iconUri: logoUrl,
            }

            await onDAppPress(discoveryDApp)
            onDismiss?.()
        }, [dapp, onDAppPress, onDismiss, logoUrl])

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
                    <RowExpandableDetails.Stats
                        appOverview={appOverview}
                        isLoading={isOverviewLoading}
                        createdAtTimestamp={dapp.createdAtTimestamp}
                    />
                    <RowExpandableDetails.Actions
                        onAddToFavorites={toggleBookmark}
                        isFavorite={isBookMarked}
                        onOpen={handleOpen}
                    />
                </RowExpandableDetails.Container>
            ),
            [
                dapp.description,
                appOverview,
                isOverviewLoading,
                dapp.createdAtTimestamp,
                toggleBookmark,
                isBookMarked,
                handleOpen,
            ],
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
    },
)

const AppList = React.memo(
    ({
        apps,
        isLoading,
        onDismiss,
        openItemId,
        onToggleOpenItem,
        appOverviews,
        isOverviewsLoading,
    }: X2EAppsListProps) => {
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
                        appOverview={appOverviews[item.id]}
                        isOverviewLoading={isOverviewsLoading}
                    />
                )
            },
            [onDismiss, openItemId, onToggleOpenItem, appOverviews, isOverviewsLoading],
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
                    windowSize={5}
                />
            )
        }

        return (
            <FlatList
                data={apps}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                onEndReachedThreshold={0.5}
                contentContainerStyle={styles.flatListPadding}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
        )
    },
)

export const AppsBottomSheet = forwardRef<BottomSheetModalMethods, X2EAppsBottomSheetProps>(
    ({ onDismiss, initialCategoryId }, ref) => {
        const { data: allApps, isLoading } = useVeBetterDaoActiveDapps()
        const theme = useTheme()
        const [openItemId, setOpenItemId] = useState<string | null>(null)
        const [animationDirection, setAnimationDirection] = useState<"left" | "right" | null>(null)

        const {
            selectedCategory,
            setSelectedCategory: originalSetSelectedCategory,
            filteredApps,
        } = useCategoryFiltering(allApps, initialCategoryId)

        const translateX = useSharedValue(0)
        const opacity = useSharedValue(1)

        const allCategories = useCategories()

        useEffect(() => {
            translateX.value = 0
            opacity.value = 1
        }, [translateX, opacity])

        const setSelectedCategory = useCallback(
            (category: { id: X2ECategoryType; displayName: string; icon: IconKey }) => {
                if (category.id === selectedCategory.id || animationDirection) return

                const currentIndex = allCategories.findIndex(cat => cat.id === selectedCategory.id)
                const newIndex = allCategories.findIndex(cat => cat.id === category.id)

                let direction: "left" | "right" | null = null
                if (newIndex > currentIndex) {
                    direction = "left"
                } else if (newIndex < currentIndex) {
                    direction = "right"
                }

                originalSetSelectedCategory(category)

                if (direction) {
                    setAnimationDirection(direction)
                }
            },
            [selectedCategory.id, allCategories, animationDirection, originalSetSelectedCategory],
        )

        const handleAnimationComplete = useCallback(() => {
            setAnimationDirection(null)
        }, [])

        useEffect(() => {
            if (!animationDirection) return

            const startTranslateX = animationDirection === "left" ? SCREEN_WIDTH : -SCREEN_WIDTH
            const exitTranslateX = animationDirection === "left" ? -SCREEN_WIDTH : SCREEN_WIDTH

            translateX.value = 0
            opacity.value = 1

            translateX.value = withTiming(exitTranslateX, {
                duration: 200,
                easing: Easing.out(Easing.quad),
            })
            opacity.value = withTiming(0.1, {
                duration: 180,
                easing: Easing.out(Easing.quad),
            })

            const timeoutId = setTimeout(() => {
                opacity.value = 0.1
                translateX.value = startTranslateX

                translateX.value = withTiming(
                    0,
                    {
                        duration: 250,
                        easing: Easing.out(Easing.quad),
                    },
                    finished => {
                        if (finished && handleAnimationComplete) {
                            runOnJS(handleAnimationComplete)()
                        }
                    },
                )
                opacity.value = withTiming(1, {
                    duration: 280,
                    easing: Easing.out(Easing.quad),
                })
            }, 150)

            return () => clearTimeout(timeoutId)
        }, [animationDirection, translateX, opacity, handleAnimationComplete])

        useEffect(() => {
            return () => {
                if (animationDirection) {
                    setAnimationDirection(null)
                }
            }
        }, [animationDirection])

        const contentAnimatedStyle = useAnimatedStyle(() => {
            return {
                flex: 1,
                transform: [{ translateX: translateX.value }],
                opacity: opacity.value,
            }
        }, [translateX, opacity])

        const appIds = useMemo(() => filteredApps.map(app => app.id), [filteredApps])
        const { overviews: appOverviews, isLoading: isOverviewsLoading } = useBatchAppOverviews(
            appIds,
            !isLoading && appIds.length > 0,
        )

        const handleToggleOpenItem = useCallback((itemId: string) => {
            setOpenItemId(prevId => (prevId === itemId ? null : itemId))
        }, [])

        useEffect(() => {
            setOpenItemId(null)
        }, [selectedCategory.id])

        const handleDismiss = useCallback(() => {
            setOpenItemId(null)
            onDismiss?.()
        }, [onDismiss])

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
                onDismiss={handleDismiss}
                floating={false}
                noMargins={true}
                enableContentPanningGesture={false}
                backgroundStyle={{ backgroundColor: theme.colors.card }}>
                {headerContent}
                <Animated.View style={contentAnimatedStyle}>
                    <AppList
                        apps={filteredApps}
                        isLoading={isLoading}
                        onDismiss={handleDismiss}
                        openItemId={openItemId}
                        onToggleOpenItem={handleToggleOpenItem}
                        appOverviews={appOverviews}
                        isOverviewsLoading={isOverviewsLoading}
                    />
                </Animated.View>
            </BaseBottomSheet>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        flatListPadding: { paddingBottom: 24, paddingTop: 32, paddingHorizontal: 24 },
    })
