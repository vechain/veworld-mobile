import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import {
    BaseAccordion,
    BaseImage,
    BaseSpacer,
    BaseText,
    BaseView,
    PicassoAddressIcon,
} from "~Components"
import { NftsList } from "./NftsList"
import { NonFungibleTokenCollection } from "~Model"
import { isEmpty } from "lodash"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type Props = {
    collection: NonFungibleTokenCollection
}

export const CollectionAccordion = ({ collection }: Props) => {
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const headerComponent = useMemo(() => {
        return (
            <BaseView flexDirection="row" justifyContent="center">
                {!isEmpty(collection.icon) ? (
                    <BaseImage
                        uri={collection.icon}
                        style={baseStyles.nftPreviewImage}
                    />
                ) : (
                    <PicassoAddressIcon
                        address={selectedAccount!.address}
                        size={32}
                        borderRadius={16}
                        style={baseStyles.collectionImageMargin}
                    />
                )}
                <BaseText typographyFont="subTitleBold">
                    {collection.name}
                </BaseText>

                <BaseSpacer width={10} />

                <BaseText>{collection.balanceOf}</BaseText>
            </BaseView>
        )
    }, [
        collection.balanceOf,
        collection.icon,
        collection.name,
        selectedAccount,
    ])

    const bodyComponent = useMemo(() => {
        return <NftsList nfts={collection.nfts} />
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
