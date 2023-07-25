import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useEffect, useRef, useState } from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { NFTImage, BaseText, BaseView } from "~Components"
import {
    NFTMediaType,
    NonFungibleToken,
    NonFungibleTokenCollection,
} from "~Model"
import { Routes } from "~Navigation"
import { selectPendingTx, useAppSelector } from "~Storage/Redux"
import { MediaUtils } from "~Utils"
import { Video, ResizeMode } from "expo-av"
import { NFTPlaceholder } from "~Assets"
import { useI18nContext } from "~i18n"
import HapticsService from "~Services/HapticsService"
import { resolveMimeType } from "~Hooks/useNft/Helpers"

type Props = {
    nft: NonFungibleToken
    index: number
    collection: NonFungibleTokenCollection
}

export const NFTView = memo(({ nft, index, collection }: Props) => {
    const nav = useNavigation()
    const [isImage, setIsImage] = useState(false)
    const [isVideo, setIsVideo] = useState(false)
    const video = useRef(null)
    const { LL } = useI18nContext()

    const isPendingTx = useAppSelector(state => selectPendingTx(state, nft.id!))

    const onNftPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        nav.navigate(Routes.NFT_DETAILS, {
            collectionAddress: collection.address,
            nftTokenId: nft.tokenId,
        })
    }, [nft, collection, nav])

    const renderNFTStaticImage = useCallback(
        () => (
            <NFTImage uri={NFTPlaceholder} style={baseStyles.nftPreviewImage} />
        ),
        [],
    )

    useEffect(() => {
        if (nft.mimeType) {
            setIsImage(
                MediaUtils.isValidMimeType(nft.mimeType, [NFTMediaType.IMAGE]),
            )
            setIsVideo(
                MediaUtils.isValidMimeType(nft.mimeType, [NFTMediaType.VIDEO]),
            )
        } else {
            // Resolve mime type
            resolveMimeType(nft.image).then(mimeType => {
                setIsImage(
                    MediaUtils.isValidMimeType(mimeType, [NFTMediaType.IMAGE]),
                )
                setIsVideo(
                    MediaUtils.isValidMimeType(mimeType, [NFTMediaType.VIDEO]),
                )
            })
        }
    }, [nft])

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            // Workaround -> https://github.com/mpiannucci/react-native-context-menu-view/issues/60#issuecomment-1453864955
            onLongPress={() => {}}
            onPress={onNftPress}
            style={[
                baseStyles.nftContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                },
            ]}>
            <BaseView style={baseStyles.nftCollectionNameBarRadius}>
                {isImage && (
                    <NFTImage
                        uri={nft.image}
                        style={baseStyles.nftPreviewImage}
                    />
                )}

                {isVideo && (
                    <BaseView style={baseStyles.nftPreviewImage}>
                        <Video
                            PosterComponent={renderNFTStaticImage}
                            usePoster
                            ref={video}
                            shouldPlay
                            style={baseStyles.nftPreviewImage}
                            source={{ uri: nft.image }}
                            resizeMode={ResizeMode.COVER}
                            isLooping
                            isMuted
                        />
                    </BaseView>
                )}

                {!isImage && !isVideo && (
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
                    <BaseText color={COLORS.WHITE} numberOfLines={1} w={80}>
                        #{nft.tokenId}
                    </BaseText>
                </BaseView>
            </BaseView>
        </TouchableOpacity>
    )
})

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
