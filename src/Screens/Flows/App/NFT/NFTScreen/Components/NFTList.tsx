import { StyleSheet, FlatList } from "react-native"
import React, { Ref, useCallback } from "react"
import { BaseSpacer } from "~Components"
import { NFTCollectionView } from "../../NFTCollectionView"
import { NftCollection } from "~Model"
import { ListFooterView } from "./ListFooterView"
import { MathUtils } from "~Utils"

type NFTListProps = {
    item: NftCollection
    index: number
}

type Props = {
    collections: NftCollection[]
    isLoading: boolean
    onGoToBlackListed: () => void
    fetchMoreCollections: () => void
    onMomentumScrollBegin: () => void
    hasNext: boolean
    flatListRef: Ref<FlatList>
}

export const NFTList = ({
    collections,
    fetchMoreCollections,
    isLoading,
    onGoToBlackListed,
    onMomentumScrollBegin,
    hasNext,
    flatListRef,
}: Props) => {
    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderNftCollection = useCallback(
        ({ item, index }: NFTListProps) => (
            <NFTCollectionView key={`NFT_${item.address}`} collection={item} index={index} />
        ),
        [],
    )

    return (
        <FlatList
            ref={flatListRef}
            data={collections}
            extraData={collections}
            contentContainerStyle={[baseStyles.listContainer]}
            numColumns={2}
            keyExtractor={item => String(item.address)}
            ItemSeparatorComponent={renderSeparator}
            renderItem={renderNftCollection}
            onScroll={onMomentumScrollBegin}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onEndReachedThreshold={0.1}
            onEndReached={fetchMoreCollections}
            ListHeaderComponentStyle={baseStyles.listheader}
            ListFooterComponentStyle={baseStyles.listFooter}
            ListFooterComponent={
                <ListFooterView
                    onGoToBlackListed={onGoToBlackListed}
                    isLoading={isLoading}
                    hasNext={hasNext}
                    renderExtraSkeleton={MathUtils.getOdd(collections.length)}
                />
            }
        />
    )
}

const baseStyles = StyleSheet.create({
    listContainer: {
        marginHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
    },
    listheader: {
        marginBottom: 24,
    },
    listFooter: { zIndex: -1 },
})
