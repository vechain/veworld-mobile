import { useQueryClient } from "@tanstack/react-query"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { FlatList } from "react-native"
import { RefreshControl } from "react-native-gesture-handler"
import { Layout } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    selectAllFavoriteCollections,
    selectBlackListedAddresses,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { CollectionsList } from "./Components/CollectionsList"
import { CollectionsScreenFooter } from "./Components/CollectionsScreenFooter"
import { useNFTCollections } from "./Hooks"

export const CollectionsScreen = () => {
    const { LL } = useI18nContext()
    const scrollRef = useRef<FlatList<string>>(null)

    const [isRefreshing, setIsRefreshing] = useState(false)

    const theme = useTheme()
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

    const invalidateCollectiblesQueries = useCallback(async () => {
        await queryClient.invalidateQueries({
            predicate(query) {
                const queryKey = query.queryKey as string[]
                if (!["COLLECTIBLES"].includes(queryKey[0])) return false
                if (queryKey.length < 4) return false
                if (queryKey[2] !== selectedNetwork.genesis.id) return false
                if (!AddressUtils.compareAddresses(queryKey[3], selectedAccount.address!)) return false
                return true
            },
        })
    }, [queryClient, selectedAccount.address, selectedNetwork.genesis.id])

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await invalidateCollectiblesQueries()
        setIsRefreshing(false)
    }, [invalidateCollectiblesQueries])

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <Layout
            title={LL.COLLECTIONS()}
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
                    ListFooterComponent={CollectionsScreenFooter}
                />
            }
        />
    )
}
