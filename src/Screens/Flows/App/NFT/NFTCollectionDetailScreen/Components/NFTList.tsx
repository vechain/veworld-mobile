import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseSpacer } from "~Components"
import { usePlatformBottomInsets } from "~Hooks"
import { HeaderComponent } from "./HeaderComponent"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { NFTView } from "../../Components"
import { ListFooterView } from "../../NFTScreen/Components/ListFooterView"

type Props = {
    collection: NonFungibleTokenCollection
    NFTs: NonFungibleToken[]
    isLoading: boolean
    fetchMoreNFTs: () => void
}

export const NFTList = ({
    collection,
    NFTs,
    fetchMoreNFTs,
    isLoading,
}: Props) => {
    const { calculateBottomInsets } = usePlatformBottomInsets()

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
            style={{ marginBottom: calculateBottomInsets }}
            ListHeaderComponent={<HeaderComponent collection={collection} />}
            data={NFTs}
            ItemSeparatorComponent={contactsListSeparator}
            numColumns={2}
            keyExtractor={(item: NonFungibleToken) => String(item?.tokenId)}
            extraData={collection?.nfts ?? []}
            renderItem={renderItem}
            contentContainerStyle={baseStyles.listContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onEndReachedThreshold={1}
            onEndReached={fetchMoreNFTs}
            ListFooterComponent={<ListFooterView isLoading={isLoading} />}
        />
    )
}

const baseStyles = StyleSheet.create({
    listContainer: {
        paddingTop: 12,
        marginHorizontal: 20,
    },
})
