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
    selectPendingTx,
    selectSelectedAccount,
    selectSelectedNetwork,
    setBlackListCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { MediaUtils } from "~Utils"
import { Video, ResizeMode } from "expo-av"
import { NFTPlaceholder } from "~Assets"
import { useI18nContext } from "~i18n"

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
        const network = useAppSelector(selectSelectedNetwork)
        const dispatch = useAppDispatch()
        const video = useRef(null)
        const { LL } = useI18nContext()

        const selectedAccoount = useAppSelector(selectSelectedAccount)

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

        const isPendingTx = useAppSelector(state =>
            selectPendingTx(state, nftItem?.id!),
        )

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
                        setBlackListCollection({
                            network: network.type,
                            collection: collectionItem!,
                            accountAddress: selectedAccoount.address,
                        }),
                    )

                if (itemAction === ItemTitle.SHOW_COLLECTION)
                    dispatch(
                        removeBlackListCollection({
                            network: network.type,
                            collection: collectionItem!,
                            accountAddress: selectedAccoount.address,
                        }),
                    )
            },
            [
                CollectionItem,
                collectionItem,
                dispatch,
                network,
                isCollection,
                selectedAccoount.address,
            ],
        )

        const getIsValidMimeType = useCallback(
            (itemUrl: string, type: NFTMediaType[]) => {
                return MediaUtils.getMime(itemUrl, type)
            },
            [],
        )

        const renderNFTStaticImage = useCallback(
            () => (
                <NFTImage
                    uri={NFTPlaceholder}
                    style={baseStyles.nftPreviewImage}
                />
            ),
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
                                    getIsValidMimeType(
                                        collectionItem!.mimeType,
                                        [NFTMediaType.IMAGE],
                                    )
                                        ? collectionItem!.image
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
                            {getIsValidMimeType(nftItem!.mimeType, [
                                NFTMediaType.IMAGE,
                            ]) && (
                                <NFTImage
                                    uri={nftItem!.image}
                                    style={baseStyles.nftPreviewImage}
                                />
                            )}

                            {MediaUtils.getMime(nftItem!.mimeType, [
                                NFTMediaType.VIDEO,
                            ]) && (
                                <BaseView style={baseStyles.nftPreviewImage}>
                                    <Video
                                        PosterComponent={renderNFTStaticImage}
                                        usePoster
                                        ref={video}
                                        shouldPlay
                                        style={baseStyles.nftPreviewImage}
                                        source={{ uri: nftItem!.image }}
                                        resizeMode={ResizeMode.COVER}
                                        isLooping
                                        isMuted
                                    />
                                </BaseView>
                            )}

                            {!MediaUtils.getMime(nftItem!.mimeType, [
                                NFTMediaType.IMAGE,
                            ]) &&
                                !MediaUtils.getMime(nftItem!.mimeType, [
                                    NFTMediaType.VIDEO,
                                ]) && (
                                    <NFTImage
                                        uri={NFTPlaceholder}
                                        style={baseStyles.nftPreviewImage}
                                    />
                                )}

                            {isPendingTx && (
                                <BaseView
                                    w={43}
                                    style={baseStyles.nftPendingLabel}
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="space-between">
                                    <BaseText
                                        typographyFont="caption"
                                        color={COLORS.WHITE}
                                        w={80}>
                                        {LL.ACTIVITIES_STATUS_pending()}
                                    </BaseText>
                                </BaseView>
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
    nftPendingLabel: {
        position: "absolute",
        height: 18,
        top: 0,
        left: 0,
        backgroundColor: COLORS.DARK_ORANGE_ALERT,
        paddingStart: 12,
        borderBottomRightRadius: 13,
    },
})
