import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import React, { useCallback, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet } from "react-native"
import { BaseSpacer, BaseView } from "~Components"
import { CollectibleBottomSheet } from "~Components/Collectibles/CollectibleBottomSheet"
import { Spinner } from "~Components/Reusable/Spinner"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { getNftsForContract } from "~Networking"
import { selectAllFavoriteNfts, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { CollectibleCard } from "../../BalanceScreen/Components/Collectibles/CollectibleCard"
import { CollectibleCardSkeleton } from "./CollectibleCardSkeleton"

const ITEMS_PER_PAGE = 10

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

const ListFooterComponent = ({ isLoading }: { isLoading: boolean }) => {
    if (!isLoading) return null

    return (
        <BaseView py={16} alignItems="center" justifyContent="center">
            <Spinner size={24} color={COLORS.PURPLE} />
        </BaseView>
    )
}

type Props = {
    collectionAddress: string
}

const getCollectionNftsQueryKey = (collectionAddress: string, genesisId: string, accountAddress: string) => [
    "COLLECTIBLES",
    "COLLECTION_NFTS",
    genesisId,
    accountAddress,
    collectionAddress,
]

export const CollectionNftsList = ({ collectionAddress }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const favoriteNfts = useAppSelector(selectAllFavoriteNfts)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { ref, onOpen } = useBottomSheetModal()
    const queryClient = useQueryClient()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const {
        data: paginatedNfts,
        fetchNextPage,
        isLoading: isLoadingNfts,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: getCollectionNftsQueryKey(collectionAddress, selectedNetwork.genesis.id, selectedAccount.address),
        queryFn: ({ pageParam = 0 }) =>
            getNftsForContract(
                selectedNetwork.type,
                collectionAddress,
                selectedAccount.address,
                ITEMS_PER_PAGE,
                pageParam,
            ),
        getNextPageParam: (lastPage, allPages) => (lastPage.pagination.hasNext ? allPages.length : undefined),
        initialPageParam: 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await queryClient.invalidateQueries({
            queryKey: getCollectionNftsQueryKey(collectionAddress, selectedNetwork.genesis.id, selectedAccount.address),
            refetchType: "all",
            exact: true,
        })
        setIsRefreshing(false)
    }, [queryClient, collectionAddress, selectedAccount.address, selectedNetwork.genesis.id])

    const nfts = useMemo(() => {
        const filteredFavorites = favoriteNfts.filter(nft =>
            AddressUtils.compareAddresses(nft.address, collectionAddress),
        )

        const apiNfts = paginatedNfts?.pages.flatMap(page => page.data) ?? []

        return (
            filteredFavorites
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(({ createdAt: _createdAt, ...rest }) => rest)
                .concat(apiNfts.map(nft => ({ address: nft.contractAddress, tokenId: nft.tokenId })))
                //Deduplicate items
                .reduce((acc, curr) => {
                    if (
                        acc.find(
                            v => AddressUtils.compareAddresses(curr.address, v.address) && curr.tokenId === v.tokenId,
                        )
                    )
                        return acc
                    acc.push(curr)
                    return acc
                }, [] as { address: string; tokenId: string }[])
        )
    }, [paginatedNfts?.pages, favoriteNfts, collectionAddress])

    const onPress = useCallback(
        ({ address, tokenId }: { address: string; tokenId: string }) => {
            onOpen({ address, tokenId })
        },
        [onOpen],
    )

    const renderItemSkeleton = useCallback(() => {
        return <CollectibleCardSkeleton />
    }, [])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<{ address: string; tokenId: string }>) => {
            return <CollectibleCard address={item.address} tokenId={item.tokenId} onPress={onPress} />
        },
        [onPress],
    )

    const onEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <>
            {isLoadingNfts ? (
                <FlatList
                    data={[1, 2, 3, 4, 5, 6, 7, 8].map(item => item.toString())}
                    keyExtractor={item => item}
                    numColumns={2}
                    renderItem={renderItemSkeleton}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.listColumn}
                />
            ) : (
                <FlatList
                    renderItem={renderItem}
                    data={nfts}
                    numColumns={2}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    ListFooterComponent={<ListFooterComponent isLoading={isFetchingNextPage} />}
                    horizontal={false}
                    keyExtractor={v => `${v.address}_${v.tokenId}`}
                    columnWrapperStyle={styles.listColumn}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.border}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
            <CollectibleBottomSheet bsRef={ref} />
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listColumn: {
            columnGap: 8,
        },
        skeletonRoot: {
            maxWidth: "50%",
            height: "100%",
            aspectRatio: 0.8791,
            overflow: "hidden",
            flex: 1,
            borderRadius: 12,
            position: "relative",
            justifyContent: "flex-end",
        },
    })
