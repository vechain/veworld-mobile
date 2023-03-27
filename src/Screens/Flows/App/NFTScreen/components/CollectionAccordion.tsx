import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseAccordion, BaseText, BaseView } from "~Components"
import { NFTItem } from "../NFTScreen"
import { NftsList } from "./NftsList"

type Props = {
    collection: { title: string; list: NFTItem[] }
}

export const CollectionAccordion = ({ collection }: Props) => {
    const headerComponent = useMemo(() => {
        return (
            <BaseView flexDirection="row">
                <BaseView style={baseStyles.nftPreviewImage} />
                <BaseText typographyFont="subTitleBold">
                    {collection.title}
                </BaseText>
            </BaseView>
        )
    }, [collection])

    return (
        <BaseAccordion
            headerComponent={headerComponent}
            headerStyle={baseStyles.headerStyle}
            bodyComponent={<NftsList nfts={collection.list} />}
        />
    )
}

const baseStyles = StyleSheet.create({
    headerStyle: { paddingHorizontal: 20 },

    nftPreviewImage: {
        width: 32,
        height: 32,
        backgroundColor: "pink",
        borderRadius: 16,
        marginRight: 10,
    },
})
