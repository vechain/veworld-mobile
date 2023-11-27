import React, { useCallback, useRef } from "react"
import { ExpandedNFT, useNftDiscovery } from "~Hooks/useNftDiscovery/useNftDiscovery"
import { FlatList } from "react-native-gesture-handler"
import { useScrollToTop } from "@react-navigation/native"
import { StyleSheet } from "react-native"
import { BaseSpacer } from "~Components"
import { NFTCard } from "~Screens/Flows/App/DiscoverScreen/Components/NFTCard"
import { ListFooterView } from "~Screens/Flows/App/NFT/NFTScreen/Components/ListFooterView"
import { MathUtils } from "~Utils"

type Props = {
    filteredSearch?: string
    setFilteredSearch: (search: string | undefined) => void
}

export const NFTList: React.FC<Props> = ({ filteredSearch, setFilteredSearch }) => {
    const { paginatedNfts, loadMore, hasMore, isLoading } = useNftDiscovery()

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderItem = useCallback(
        ({ item }: { item: ExpandedNFT }) => {
            return <NFTCard nft={item} setFilteredSearch={setFilteredSearch} />
        },
        [setFilteredSearch],
    )

    const nftList = React.useMemo(() => {
        if (!filteredSearch) return paginatedNfts

        return paginatedNfts.filter(nft => {
            return (
                nft.name.toLowerCase().includes(filteredSearch.toLowerCase()) ||
                nft.description.toLowerCase().includes(filteredSearch.toLowerCase()) ||
                nft.address.toLowerCase().includes(filteredSearch.toLowerCase())
            )
        })
    }, [filteredSearch, paginatedNfts])

    return (
        <FlatList
            ref={flatListRef}
            data={nftList}
            contentContainerStyle={styles.container}
            ItemSeparatorComponent={renderSeparator}
            scrollEnabled={true}
            keyExtractor={item => item.address}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            onEndReached={loadMore}
            ListFooterComponent={
                <ListFooterView
                    isLoading={isLoading}
                    hasNext={hasMore}
                    renderExtraSkeleton={MathUtils.getOdd(paginatedNfts.length)}
                />
            }
        />
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
})
