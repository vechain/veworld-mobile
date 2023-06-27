import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useMemo, useRef } from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { NFTImage, BaseText, BaseView, LongPressProvider } from "~Components"
import {
    NFTMediaType,
    NonFungibleToken,
    NonFungibleTokenCollection,
} from "~Model"
import { Routes } from "~Navigation"
import {
    removeBlackListCollection,
    setBlackListCollection,
    useAppDispatch,
} from "~Storage/Redux"
import { MediaUtils } from "~Utils"
import { Video, ResizeMode } from "expo-av"
import { NFTPlaceholder } from "~Assets"

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
}

export const NFTView = memo(
    ({
        item,
        index,
        isCollection = false,
        collection,
        isHidden = false,
    }: Props) => {
        const nav = useNavigation()
        const dispatch = useAppDispatch()
        const video = useRef(null)

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

                if (isCollection) itemAction = CollectionItem[_index]?.title

                if (itemAction === ItemTitle.HIDE_COLLECTION)
                    dispatch(
                        setBlackListCollection({ collection: collectionItem! }),
                    )

                if (itemAction === ItemTitle.SHOW_COLLECTION)
                    dispatch(
                        removeBlackListCollection({
                            collection: collectionItem!,
                        }),
                    )
            },
            [CollectionItem, collectionItem, dispatch, isCollection],
        )

        const getIsvalidMimeType = useCallback(
            (itemUrl: string, type: NFTMediaType[]) =>
                MediaUtils.getMime(itemUrl, type),
            [],
        )

        return (
            <TouchableOpacity
                activeOpacity={0.6}
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
                        justifyContent:
                            index % 2 === 0 ? "flex-start" : "flex-end",
                    },
                ]}>
                <LongPressProvider
                    items={CollectionItem}
                    action={handleOnItemLongPress}>
                    {isCollection ? (
                        <BaseView style={baseStyles.nftCollectionNameBarRadius}>
                            <NFTImage
                                uri={
                                    getIsvalidMimeType(
                                        collectionItem?.icon.mime!,
                                        [NFTMediaType.IMAGE],
                                    )
                                        ? collectionItem!.icon.url
                                        : NFTPlaceholder
                                }
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
                                        {!collectionItem?.hasCount && "+"}
                                        {collectionItem!.balanceOf}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                        </BaseView>
                    ) : (
                        <BaseView style={baseStyles.nftCollectionNameBarRadius}>
                            {getIsvalidMimeType(nftItem?.icon.mime!, [
                                NFTMediaType.IMAGE,
                            ]) && (
                                <NFTImage
                                    uri={nftItem!.icon.url}
                                    style={baseStyles.nftPreviewImage}
                                />
                            )}

                            {MediaUtils.getMime(nftItem?.icon.mime!, [
                                NFTMediaType.VIDEO,
                            ]) && (
                                <BaseView style={baseStyles.nftPreviewImage}>
                                    <Video
                                        PosterComponent={() => (
                                            <NFTImage
                                                uri={NFTPlaceholder}
                                                style={
                                                    baseStyles.nftPreviewImage
                                                }
                                            />
                                        )}
                                        usePoster
                                        ref={video}
                                        shouldPlay
                                        style={baseStyles.nftPreviewImage}
                                        source={{ uri: nftItem!.icon.url }}
                                        resizeMode={ResizeMode.COVER}
                                        isLooping
                                        isMuted
                                    />
                                </BaseView>
                            )}

                            {!MediaUtils.getMime(nftItem?.icon.mime!, [
                                NFTMediaType.IMAGE,
                            ]) &&
                                !MediaUtils.getMime(nftItem?.icon.mime!, [
                                    NFTMediaType.VIDEO,
                                ]) && (
                                    <NFTImage
                                        uri={NFTPlaceholder}
                                        style={baseStyles.nftPreviewImage}
                                    />
                                )}

                            <BaseView
                                style={baseStyles.nftCollectionNameBar}
                                flexDirection="row"
                                alignItems="center"
                                justifyContent="space-between">
                                <BaseText
                                    color={COLORS.WHITE}
                                    numberOfLines={1}
                                    w={80}>
                                    #{nftItem?.tokenId}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    )}
                </LongPressProvider>
            </TouchableOpacity>
        )
    },
)

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
        paddingHorizontal: 12,
    },
    nftCollectionNameBarRadius: {
        overflow: "hidden",
        borderRadius: 13,
    },
    nftCounterLabel: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 4,
        borderRadius: 13,
        backgroundColor: COLORS.DARK_PURPLE,
    },
})
