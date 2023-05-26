import React, { memo, useCallback } from "react"
import { BaseSpacer, BaseView } from "~Components"
import { CollectionAccordion } from "./CollectionAccordion"
import { selectNftCollections, useAppSelector } from "~Storage/Redux"
import { FlashList } from "@shopify/flash-list"
import { NonFungibleTokenCollection } from "~Model"
import { isEmpty } from "lodash"
import { NftSkeleton } from "./NftSkeleton"

export const CollectionsList = memo(() => {
    const nftCollections = useAppSelector(selectNftCollections)

    const renderSeparator = useCallback(() => <BaseSpacer height={12} />, [])

    const renderNftCollection = useCallback(
        ({ item }: { item: NonFungibleTokenCollection }) => {
            const collectionWithMissingNftData = item.nfts.filter(
                nft => !isEmpty(nft.image),
            )

            if (collectionWithMissingNftData.length) {
                return (
                    <BaseView key={`${item.address}`}>
                        <CollectionAccordion collection={item} />
                    </BaseView>
                )
            } else {
                return null
            }
        },
        [],
    )

    return (
        <>
            {!isEmpty(nftCollections) ? (
                <FlashList
                    data={nftCollections}
                    keyExtractor={item => String(item.address)}
                    ItemSeparatorComponent={renderSeparator}
                    renderItem={renderNftCollection}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={nftCollections.length * 180}
                    estimatedListSize={{
                        height: 180,
                        width:
                            180 * nftCollections.length +
                            (nftCollections.length - 1) * 12,
                    }}
                />
            ) : (
                <NftSkeleton />
            )}
        </>
    )
})
