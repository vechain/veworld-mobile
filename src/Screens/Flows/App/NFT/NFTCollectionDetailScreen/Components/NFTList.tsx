import React, { useCallback } from "react"
import { BaseSpacer } from "~Components"
import { HeaderComponent } from "./HeaderComponent"
import { NonFungibleToken, NftCollection } from "~Model"
import { NFTView } from "../../NFTView"
import { ListFooterView } from "../../NFTScreen/Components/ListFooterView"
import { FlashList } from "@shopify/flash-list"

type Props = {
    collection: NftCollection
    nfts: NonFungibleToken[]
    isLoading: boolean
    fetchMoreNFTs: () => void
    onMomentumScrollBegin: () => void
    hasNext: boolean
}

export const NFTList = ({
    collection,
    nfts,
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
            <NFTView nft={item} index={index} collection={collection} />
        ),
        [collection],
    )

    return (
        <FlashList
            ListHeaderComponent={<HeaderComponent collection={collection} />}
            data={nfts}
            ItemSeparatorComponent={contactsListSeparator}
            numColumns={2}
            keyExtractor={(item: NonFungibleToken) => String(item.id)}
            extraData={[]}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={onMomentumScrollBegin}
            onEndReachedThreshold={0.2}
            onEndReached={fetchMoreNFTs}
            removeClippedSubviews={true}
            ListFooterComponent={
                <>
                    <ListFooterView isLoading={isLoading} hasNext={hasNext} />
                    {!isLoading && <BaseSpacer height={16} />}
                </>
            }
            estimatedItemSize={160}
        />
    )
}
