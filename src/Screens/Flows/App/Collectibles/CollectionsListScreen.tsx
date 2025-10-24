import React, { useCallback, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSpacer, Layout } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useNFTRegistry } from "~Hooks/useNft/useNFTRegistry"
import { selectAllFavoriteCollections, useAppSelector } from "~Storage/Redux"
import { CollectiblesEmptyCard } from "../BalanceScreen/Components/Collectibles/CollectiblesEmptyCard"
import { useFetchCollections } from "../NFT/NFTScreen/useFetchCollections"
import { CollectionCard } from "./Components/CollectionCard"

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

export const CollectionsListScreen: React.FC = () => {
    const { styles } = useThemedStyles(baseStyles)
    useNFTRegistry()
    const favoriteCollections = useAppSelector(selectAllFavoriteCollections)

    const [onEndReachedCalledDuringMomentum, setEndReachedCalledDuringMomentum] = useState(true)

    const {
        fetchMoreCollections,
        collections,
        isLoading: isCollectionsLoading,
    } = useFetchCollections(onEndReachedCalledDuringMomentum, setEndReachedCalledDuringMomentum)

    const favoriteAddresses = useMemo(() => {
        return new Set(favoriteCollections.map(fav => fav.address.toLowerCase()))
    }, [favoriteCollections])

    const sortedCollections = useMemo(() => {
        return [...collections].sort((a, b) => {
            const aIsFavorite = favoriteAddresses.has(a.address.toLowerCase())
            const bIsFavorite = favoriteAddresses.has(b.address.toLowerCase())

            if (aIsFavorite && !bIsFavorite) return -1
            if (!aIsFavorite && bIsFavorite) return 1
            return 0
        })
    }, [collections, favoriteAddresses])

    const onMomentumScrollBegin = useCallback(() => {
        setEndReachedCalledDuringMomentum(true)
    }, [])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<{ address: string; name?: string; image?: string; balanceOf?: number }>) => {
            return (
                <CollectionCard
                    collectionAddress={item.address}
                    name={item.name}
                    image={item.image}
                    count={item.balanceOf}
                />
            )
        },
        [],
    )

    return (
        <Layout
            title={"Collections"}
            fixedBody={
                !isCollectionsLoading && (
                    <FlatList
                        renderItem={renderItem}
                        data={sortedCollections}
                        numColumns={2}
                        ItemSeparatorComponent={ItemSeparatorComponent}
                        ListEmptyComponent={CollectiblesEmptyCard}
                        keyExtractor={v => v.address}
                        columnWrapperStyle={styles.listColumn}
                        style={styles.list}
                        onEndReached={fetchMoreCollections}
                        onEndReachedThreshold={0.5}
                        onMomentumScrollBegin={onMomentumScrollBegin}
                    />
                )
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listColumn: {
            columnGap: 8,
        },
        list: {
            paddingHorizontal: 16,
        },
    })
