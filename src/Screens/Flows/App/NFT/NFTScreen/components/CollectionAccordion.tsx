import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import {
    BaseAccordion,
    BaseImage,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { NftsList } from "./NftsList"
import { NonFungibleTokenCollection } from "~Model"

type Props = {
    collection: NonFungibleTokenCollection
}

export const CollectionAccordion = ({ collection }: Props) => {
    const headerComponent = useMemo(() => {
        return (
            <BaseView flexDirection="row" justifyContent="center">
                <BaseImage
                    uri={collection.icon}
                    style={baseStyles.nftPreviewImage}
                />

                <BaseText typographyFont="subTitleBold">
                    {collection.name}
                </BaseText>
                <BaseSpacer width={10} />
                <BaseText>{collection.balanceOf}</BaseText>
            </BaseView>
        )
    }, [collection.balanceOf, collection.icon, collection.name])

    const bodyComponent = useMemo(() => {
        const seeAllButton =
            collection.nfts.length > 1
                ? {
                      title: "See All",
                      image: "arrow-right",
                      tokenId: "see-all",
                      collectionAddress: collection.address,
                  }
                : undefined

        return <NftsList nfts={[...collection.nfts, seeAllButton]} />
    }, [collection])

    return (
        <BaseAccordion
            headerComponent={headerComponent}
            headerStyle={baseStyles.headerStyle}
            bodyComponent={bodyComponent}
            defaultIsOpen
        />
    )
}

const baseStyles = StyleSheet.create({
    headerStyle: { paddingHorizontal: 20 },
    collectionImageMargin: { marginRight: 10 },
    nftPreviewImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
})
