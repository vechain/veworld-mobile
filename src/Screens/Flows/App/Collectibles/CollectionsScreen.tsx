import { useNavigation } from "@react-navigation/native"
import { useQueryClient } from "@tanstack/react-query"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { RefreshControl } from "react-native-gesture-handler"
import Animated, { SequencedTransition } from "react-native-reanimated"
import { BaseSpacer, Layout } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import {
    selectAllFavoriteCollections,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { CollectionCard, SkeletonCollectionCard } from "./Components"
import { getNFTCollectionsQueryKey, useNFTCollections } from "./Hooks"

export const CollectionsScreen = () => {
    const scrollRef = useRef<FlatList<string>>(null)

    const [isRefreshing, setIsRefreshing] = useState(false)

    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const {
        data: paginatedCollections,
        isLoading: isCollectionsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useNFTCollections()
    const favoriteCollections = useAppSelector(selectAllFavoriteCollections)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const queryClient = useQueryClient()

    const collectionsData = useMemo(
        () => paginatedCollections?.pages.flatMap(page => page.collections) ?? [],
        [paginatedCollections],
    )

    const collections = useMemo(() => {
        return (
            favoriteCollections
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(collection => collection.address)
                .concat(collectionsData)
                //Deduplicate items by address
                .reduce((acc, curr) => {
                    if (acc.find(v => AddressUtils.compareAddresses(curr, v))) return acc
                    acc.push(curr)
                    return acc
                }, [] as string[])
        )
    }, [collectionsData, favoriteCollections])

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await queryClient.invalidateQueries({
            queryKey: getNFTCollectionsQueryKey(selectedNetwork.genesis.id, selectedAccount.address),
            refetchType: "all",
            exact: true,
        })
        setIsRefreshing(false)
    }, [queryClient, selectedAccount.address, selectedNetwork.genesis.id])

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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
                    onToggleFavorite={isFavorite => {
                        //Scroll to the top if the item is now favorite
                        if (isFavorite) {
                            scrollRef.current?.scrollToIndex({ animated: true, index: 0 })
                        }
                    }}
                />
            )
        },
        [nav],
    )

    const renderItemSkeleton = useCallback(() => {
        return <SkeletonCollectionCard />
    }, [])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={8} />
    }, [])

    return (
        <Layout
            title={"Collections"}
            fixedBody={
                !isCollectionsLoading ? (
                    <Animated.FlatList
                        ref={scrollRef}
                        keyExtractor={item => item}
                        data={collections}
                        renderItem={renderItem}
                        ItemSeparatorComponent={renderItemSeparator}
                        style={styles.list}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                                tintColor={theme.colors.border}
                            />
                        }
                        contentContainerStyle={styles.listContentContainer}
                        onEndReached={handleEndReached}
                        showsVerticalScrollIndicator={false}
                        itemLayoutAnimation={SequencedTransition.reverse()}
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
