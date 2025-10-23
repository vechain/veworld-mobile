import React, { useCallback, useEffect, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { BaseSpacer } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { selectAllFavoriteNfts, useAppSelector } from "~Storage/Redux"
import { CollectibleCard } from "../BalanceScreen/Components/Collectibles/CollectibleCard"
import { CollectibleDetailedCard } from "../BalanceScreen/Components/Collectibles/CollectibleDetailedCard"
import { CollectiblesEmptyCard } from "../BalanceScreen/Components/Collectibles/CollectiblesEmptyCard"
import { CollectiblesViewMode } from "../BalanceScreen/Components/Collectibles/ChangeCollectionsListView"
import { useNFTWithMetadata } from "../NFT/NFTCollectionDetailScreen/Hooks/useNFTWithMetadata"

type Props = {
    collectionAddress: string
    viewMode: CollectiblesViewMode
    isObservedAccount: boolean
    onNftCountChange?: (count: number) => void
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

export const CollectionsScreen: React.FC<Props> = ({
    collectionAddress,
    viewMode,
    isObservedAccount,
    onNftCountChange,
}) => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const favoriteNfts = useAppSelector(selectAllFavoriteNfts)
    const [onEndReachedCalledDuringMomentum, setEndReachedCalledDuringMomentum] = useState(true)

    const { nfts, fetchMoreNFTs } = useNFTWithMetadata(
        collectionAddress,
        onEndReachedCalledDuringMomentum,
        setEndReachedCalledDuringMomentum,
    )

    const onMomentumScrollBegin = useCallback(() => {
        setEndReachedCalledDuringMomentum(true)
    }, [])

    const favoriteNftKeys = useMemo(() => {
        return new Set(favoriteNfts.map(fav => `${fav.address.toLowerCase()}_${fav.tokenId}`))
    }, [favoriteNfts])

    const renderGalleryItem = useCallback(
        ({ item }: ListRenderItemInfo<{ address: string; tokenId: string }>) => {
            return (
                <CollectibleCard
                    address={collectionAddress}
                    tokenId={item.tokenId}
                    isObservedAccount={isObservedAccount}
                    onPress={() => {
                        nav.navigate(Routes.NFT_DETAILS, {
                            nftTokenId: item.tokenId,
                            collectionAddress: item.address,
                        })
                    }}
                />
            )
        },
        [collectionAddress, isObservedAccount, nav],
    )

    const renderDetailsItem = useCallback(
        ({ item }: ListRenderItemInfo<{ address: string; tokenId: string }>) => {
            return <CollectibleDetailedCard address={collectionAddress} tokenId={item.tokenId} />
        },
        [collectionAddress],
    )

    const nftData = useMemo(() => {
        const allNfts = nfts?.map(nft => ({ address: nft.address, tokenId: nft.tokenId })) ?? []

        // Sort NFTs: favorites first, then by original order
        return allNfts.sort((a, b) => {
            const aIsFavorite = favoriteNftKeys.has(`${a.address.toLowerCase()}_${a.tokenId}`)
            const bIsFavorite = favoriteNftKeys.has(`${b.address.toLowerCase()}_${b.tokenId}`)

            if (aIsFavorite && !bIsFavorite) return -1
            if (!aIsFavorite && bIsFavorite) return 1
            return 0
        })
    }, [nfts, favoriteNftKeys])

    useEffect(() => {
        onNftCountChange?.(nftData.length)
    }, [nftData.length, onNftCountChange])

    if (viewMode === "GALLERY") {
        return (
            <FlatList
                key="gallery-view"
                renderItem={renderGalleryItem}
                data={nftData}
                numColumns={2}
                ItemSeparatorComponent={ItemSeparatorComponent}
                ListEmptyComponent={CollectiblesEmptyCard}
                horizontal={false}
                keyExtractor={v => `${v.address}_${v.tokenId}`}
                columnWrapperStyle={styles.listColumn}
                onEndReached={fetchMoreNFTs}
                onEndReachedThreshold={0.5}
                onMomentumScrollBegin={onMomentumScrollBegin}
            />
        )
    }

    return (
        <FlatList
            key="details-view"
            renderItem={renderDetailsItem}
            data={nftData}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListEmptyComponent={CollectiblesEmptyCard}
            keyExtractor={v => `${v.address}_${v.tokenId}`}
            onEndReached={fetchMoreNFTs}
            onEndReachedThreshold={0.5}
            onMomentumScrollBegin={onMomentumScrollBegin}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listColumn: {
            columnGap: 8,
            justifyContent: "flex-start",
        },
    })
