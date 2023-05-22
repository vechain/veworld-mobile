import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseAccordion, BaseImage, BaseText, BaseView } from "~Components"
import { NftsList } from "./NftsList"
import { NonFungibleTokeCollection } from "~Model"
import { isEmpty } from "lodash"

type Props = {
    collection: NonFungibleTokeCollection
}

export const CollectionAccordion = ({ collection }: Props) => {
    const headerComponent = useMemo(() => {
        return (
            <BaseView flexDirection="row">
                {!isEmpty(collection.icon) ? (
                    <BaseImage
                        uri={collection.icon}
                        style={baseStyles.nftPreviewImage}
                    />
                ) : (
                    <BaseView style={baseStyles.nftPreviewImage} />
                )}
                <BaseText typographyFont="subTitleBold">
                    {collection.name}
                </BaseText>
            </BaseView>
        )
    }, [collection])

    return (
        <BaseAccordion
            headerComponent={headerComponent}
            headerStyle={baseStyles.headerStyle}
            bodyComponent={<NftsList nfts={collection.nfts} />}
        />
    )
}

const baseStyles = StyleSheet.create({
    headerStyle: { paddingHorizontal: 20 },

    nftPreviewImage: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderRadius: 16,
        marginRight: 10,
    },
})
