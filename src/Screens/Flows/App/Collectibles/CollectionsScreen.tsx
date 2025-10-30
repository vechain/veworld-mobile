import { useQueryClient } from "@tanstack/react-query"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet } from "react-native"
import { RefreshControl } from "react-native-gesture-handler"
import { Layout } from "~Components"
import { useThemedStyles } from "~Hooks"
import {
    selectAllFavoriteCollections,
    selectBlackListedAddresses,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { BlacklistedCollectionsList } from "./Components/BlacklistedCollectionsList"
import { CollectionsList } from "./Components/CollectionsList"
import { getNFTCollectionsQueryKey, useNFTCollections } from "./Hooks"

export const CollectionsScreen = () => {
    const scrollRef = useRef<FlatList<string>>(null)

    const [isRefreshing, setIsRefreshing] = useState(false)

    const { theme } = useThemedStyles(baseStyles)
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
    const blackListedCollections = useAppSelector(selectBlackListedAddresses)
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
                //Exclude blacklisted collections
                .filter(
                    addr =>
                        !blackListedCollections.find(blacklistedAddr =>
                            AddressUtils.compareAddresses(blacklistedAddr, addr),
                        ),
                )
                //Deduplicate items by address
                .reduce((acc, curr) => {
                    if (acc.find(v => AddressUtils.compareAddresses(curr, v))) return acc
                    acc.push(curr)
                    return acc
                }, [] as string[])
        )
    }, [blackListedCollections, collectionsData, favoriteCollections])

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

    return (
        <Layout
            title={"Collections"}
            fixedBody={
                <CollectionsList
                    scrollRef={scrollRef}
                    data={collections}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.border}
                        />
                    }
                    onEndReached={handleEndReached}
                    isLoading={isCollectionsLoading}
                    ListFooterComponent={BlacklistedCollectionsList}
                />
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
