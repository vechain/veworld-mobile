import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseSpacer } from "~Components"
import { HeaderComponent } from "./HeaderComponent"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { NFTView } from "../../Components"
import { ListFooterView } from "../../NFTScreen/Components/ListFooterView"

type Props = {
    collection: NonFungibleTokenCollection
    NFTs: NonFungibleToken[]
    isLoading: boolean
    fetchMoreNFTs: () => void
    onMomentumScrollBegin: () => void
    hasNext: boolean
}

export const NFTList = ({
    collection,
    NFTs,
    fetchMoreNFTs,
    isLoading,
    onMomentumScrollBegin,
    hasNext,
}: Props) => {
    const contactsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const renderItem = useCallback(
        ({ item, index }: { item: NonFungibleToken; index: number }) => (
            <NFTView item={item} index={index} collection={collection} />
        ),
        [collection],
    )

    return (
        <FlatList
            ListHeaderComponent={<HeaderComponent collection={collection} />}
            data={NFTs}
            initialNumToRender={6}
            ItemSeparatorComponent={contactsListSeparator}
            numColumns={2}
            keyExtractor={(item: NonFungibleToken) => String(item.id)}
            extraData={collection?.nfts ?? []}
            renderItem={renderItem}
            contentContainerStyle={baseStyles.listContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={onMomentumScrollBegin}
            onEndReachedThreshold={0.1}
            onEndReached={fetchMoreNFTs}
            ListFooterComponent={
                <>
                    <ListFooterView isLoading={isLoading} hasNext={hasNext} />
                    {!isLoading && <BaseSpacer height={16} />}
                </>
            }
        />
    )
}

const baseStyles = StyleSheet.create({
    listContainer: {
        paddingTop: 12,
        marginHorizontal: 20,
    },
})
