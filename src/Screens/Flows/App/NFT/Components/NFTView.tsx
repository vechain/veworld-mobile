import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { SCREEN_WIDTH, info } from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseImage, BaseText, BaseView, LongPressProvider } from "~Components"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { Routes } from "~Navigation"
import {
    removeBlackListCollection,
    setBlackListCollection,
    useAppDispatch,
} from "~Storage/Redux"

type Props = {
    item: NonFungibleTokenCollection | NonFungibleToken
    index: number
    isCollection?: boolean
    collection?: NonFungibleTokenCollection
    isHidden?: boolean
}

enum ItemTitle {
    HIDE_COLLECTION = "Hide collection",
    SHOW_COLLECTION = "Show collection",
    HIDE_NFT = "Hide NFT",
    SHOW_NFT = "Show NFT",
}

export const NFTView = ({
    item,
    index,
    isCollection = false,
    collection,
    isHidden = false,
}: Props) => {
    const nav = useNavigation()
    const disptatch = useAppDispatch()

    const CollectionItem = useMemo(
        () => [
            {
                title: isHidden
                    ? ItemTitle.SHOW_COLLECTION
                    : ItemTitle.HIDE_COLLECTION,
            },
        ],
        [isHidden],
    )

    const NFTItems = useMemo(
        () => [{ title: isHidden ? ItemTitle.SHOW_NFT : ItemTitle.HIDE_NFT }],
        [isHidden],
    )

    const collectionItem = isCollection
        ? (item as NonFungibleTokenCollection)
        : undefined

    const nftItem = !isCollection ? (item as NonFungibleToken) : undefined

    const onNftPress = useCallback(
        (nft: NonFungibleToken) =>
            nav.navigate(Routes.NFT_DETAILS, {
                collectionAddress: collection!.address,
                nftTokenId: nft.tokenId,
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

    const handleOnItemLongPress = useCallback(
        (_index: number) => {
            let itemAction = ""

            if (isCollection) itemAction = CollectionItem[_index].title

            if (!isCollection) itemAction = NFTItems[_index].title

            if (itemAction === ItemTitle.HIDE_COLLECTION)
                disptatch(setBlackListCollection(collectionItem!))

            if (itemAction === ItemTitle.HIDE_NFT) info("Hide NFT")

            if (itemAction === ItemTitle.SHOW_COLLECTION)
                disptatch(removeBlackListCollection(collectionItem!))

            if (itemAction === ItemTitle.SHOW_NFT) info("Show NFT")
        },
        [CollectionItem, NFTItems, collectionItem, disptatch, isCollection],
    )

    return (
        <TouchableOpacity
            // Workaround -> https://github.com/mpiannucci/react-native-context-menu-view/issues/60#issuecomment-1453864955
            onLongPress={() => {}}
            onPress={() =>
                isCollection
                    ? onCollectionPress(collectionItem!.address)
                    : onNftPress(nftItem!)
            }
            style={[
                baseStyles.nftContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                },
            ]}>
            <LongPressProvider
                items={isCollection ? CollectionItem : NFTItems}
                action={handleOnItemLongPress}>
                {isCollection ? (
                    <BaseView style={baseStyles.nftCollectionNameBarRadius}>
                        <BaseImage
                            uri={collectionItem!.icon}
                            style={baseStyles.nftPreviewImage}
                        />
                        <BaseView
                            style={baseStyles.nftCollectionNameBar}
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between">
                            <BaseText
                                color={COLORS.WHITE}
                                numberOfLines={1}
                                w={80}>
                                {item.name}
                            </BaseText>
                            <BaseView
                                style={baseStyles.nftCounterLabel}
                                justifyContent="center"
                                alignItems="center">
                                <BaseText color={COLORS.WHITE}>
                                    {collectionItem!.balanceOf}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                ) : (
                    <BaseImage
                        uri={nftItem!.image}
                        style={baseStyles.nftPreviewImage}
                    />
                )}
            </LongPressProvider>
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
        borderRadius: 13,
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
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
    },
    nftCounterLabel: {
        height: 20,
        width: 20,
        borderRadius: 13,
        backgroundColor: COLORS.DARK_PURPLE,
    },
})
