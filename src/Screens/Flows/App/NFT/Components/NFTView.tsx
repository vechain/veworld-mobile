import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { SCREEN_WIDTH } from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseImage, BaseText, BaseView } from "~Components"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { Routes } from "~Navigation"

type Props = {
    item: NonFungibleTokenCollection | NonFungibleToken
    index: number
    isCollection?: boolean
    collection?: NonFungibleTokenCollection
}

export const NFTView = ({
    item,
    index,
    isCollection = false,
    collection,
}: Props) => {
    const nav = useNavigation()

    const collectionItem = isCollection
        ? (item as NonFungibleTokenCollection)
        : undefined
    const nftItem = !isCollection ? (item as NonFungibleToken) : undefined

    const onNftPress = useCallback(
        (nft: NonFungibleToken) =>
            nav.navigate(Routes.NFT_DETAILS, {
                collection,
                nft,
            }),
        [collection, nav],
    )

    const onCollectionPress = useCallback(
        (address: string) => {
            nav.navigate(Routes.NFT_COLLECTION_DETAILS, {
                collectionAddress: address,
            })
        },
        [nav],
    )

    return (
        <TouchableOpacity
            onPress={() =>
                isCollection
                    ? onCollectionPress(collectionItem?.address ?? "")
                    : onNftPress(nftItem!)
            }
            style={[
                baseStyles.nftContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                },
            ]}>
            {isCollection ? (
                <BaseView style={baseStyles.nftCollectionNameBarRadius}>
                    <BaseImage
                        uri={collectionItem?.icon ?? ""}
                        style={baseStyles.nftPreviewImage}
                    />
                    <BaseView
                        style={baseStyles.nftCollectionNameBar}
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between">
                        <BaseText color={COLORS.WHITE}>{item.name}</BaseText>
                        <BaseView
                            style={baseStyles.nftCounterLabel}
                            justifyContent="center"
                            alignItems="center">
                            <BaseText color={COLORS.WHITE}>
                                {collectionItem?.nfts.length ?? 0}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                </BaseView>
            ) : (
                <BaseImage
                    uri={nftItem?.image ?? ""}
                    style={baseStyles.nftPreviewImage}
                />
            )}
        </TouchableOpacity>
    )
}

const baseStyles = StyleSheet.create({
    nftContainer: {
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "50%",
    },
    nftPreviewImage: {
        width: SCREEN_WIDTH / 2 - 30,
        height: 164,
        borderRadius: 16,
    },

    nftCollectionNameBar: {
        position: "absolute",
        height: 34,
        bottom: 0,
        left: 0,
        width: SCREEN_WIDTH / 2 - 30,
        backgroundColor: COLORS.DARK_PURPLE_RBGA,
        paddingHorizontal: 8,
    },
    nftCollectionNameBarRadius: {
        overflow: "hidden",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    nftCounterLabel: {
        height: 20,
        width: 20,
        borderRadius: 17,
        backgroundColor: COLORS.DARK_PURPLE,
    },
})
