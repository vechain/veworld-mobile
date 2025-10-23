import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSkeleton, BaseSpacer, BaseView, Layout } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { CollectionCard } from "./Components"
import { useNFTCollections } from "./Hooks"
import { COLORS } from "~Constants"
import { useCollectionsBookmarking } from "~Hooks/useCollectionsBookmarking"
import { AddressUtils } from "~Utils"

export const CollectionsScreen = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { data: paginatedCollections, isLoading: isCollectionsLoading, fetchNextPage } = useNFTCollections()
    const { favoriteCollections } = useCollectionsBookmarking()

    const collectionsData = useMemo(
        () => paginatedCollections?.pages.flatMap(page => page.collections) ?? [],
        [paginatedCollections],
    )

    const collections = useMemo(() => {
        return favoriteCollections
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(collection => collection.address)
            .concat(collectionsData)
            .reduce((acc, curr) => {
                if (acc.find(v => AddressUtils.compareAddresses(curr, v))) return acc
                acc.push(curr)
                return acc
            }, [] as string[])
    }, [collectionsData, favoriteCollections])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<string>) => {
            return (
                <CollectionCard
                    collectionAddress={item}
                    onPress={() => {
                        nav.navigate(Routes.COLLECTIBLES_COLLECTION_DETAILS, {
                            collectionAddress: item,
                        })
                    }}
                />
            )
        },
        [nav],
    )

    const renderItemSkeleton = useCallback(() => {
        return (
            <BaseView style={styles.skeletonRoot} testID="VBD_CAROUSEL_ITEM_SKELETON" borderRadius={12}>
                <BaseSkeleton
                    animationDirection="horizontalLeft"
                    boneColor={theme.isDark ? COLORS.LIGHT_PURPLE : COLORS.GREY_200}
                    highlightColor={theme.isDark ? COLORS.PURPLE : COLORS.GREY_300}
                    rootStyle={[StyleSheet.absoluteFill]}
                    borderRadius={12}
                    height={257}
                />
                <BaseView px={16} py={12} flexDirection="column" gap={8}>
                    <BaseView flexDirection="row" justifyContent="space-between" w={100}>
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={20}
                            width={150}
                            borderRadius={4}
                        />
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={24}
                            width={30}
                            borderRadius={99}
                        />
                    </BaseView>
                </BaseView>
            </BaseView>
        )
    }, [styles.skeletonRoot, theme.colors.skeletonBoneColor, theme.colors.skeletonHighlightColor, theme.isDark])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={8} />
    }, [])

    return (
        <Layout
            title={"Collections"}
            fixedBody={
                !isCollectionsLoading ? (
                    <FlatList
                        keyExtractor={item => item}
                        data={collections}
                        renderItem={renderItem}
                        ItemSeparatorComponent={renderItemSeparator}
                        style={styles.list}
                        contentContainerStyle={styles.listContentContainer}
                        onEndReached={() => {
                            fetchNextPage()
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <FlatList
                        keyExtractor={item => item}
                        data={[1, 2, 3, 4, 5].map(item => item.toString())}
                        renderItem={renderItemSkeleton}
                        ItemSeparatorComponent={renderItemSeparator}
                        style={styles.list}
                        contentContainerStyle={styles.listContentContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        list: {
            paddingHorizontal: 16,
        },
        listContentContainer: {
            paddingTop: 16,
            paddingBottom: 24,
        },
        skeletonRoot: {
            width: "100%",
            height: 182,
            position: "relative",
            overflow: "hidden",
            justifyContent: "flex-end",
        },
    })
