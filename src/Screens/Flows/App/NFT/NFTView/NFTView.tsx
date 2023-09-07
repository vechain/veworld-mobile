import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useMemo, useRef } from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { NFTImage, BaseText, BaseView } from "~Components"
import { NFTMediaType, NonFungibleToken, NftCollection } from "~Model"
import { Routes } from "~Navigation"
import { selectPendingTx, useAppSelector } from "~Storage/Redux"
import { Video, ResizeMode } from "expo-av"
import { NFTPlaceholder } from "~Assets"
import { useI18nContext } from "~i18n"
import HapticsService from "~Services/HapticsService"
import SkeletonContent from "react-native-skeleton-content-nonexpo"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"

type Props = {
    nft: NonFungibleToken
    index: number
    collection: NftCollection
}

export const NFTView = memo(({ nft, index, collection }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const video = useRef(null)
    const { LL } = useI18nContext()

    const isPendingTx = useAppSelector(state => selectPendingTx(state, nft.id))

    const onNftPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        nav.navigate(Routes.NFT_DETAILS, {
            collectionAddress: collection.address,
            nftTokenId: nft.tokenId,
        })
    }, [nft, collection, nav])

    const renderNFTStaticImage = useCallback(
        () => (
            <NFTImage
                uri={NFTPlaceholder}
                // @ts-ignore
                style={styles.nftPreviewImage}
            />
        ),
        [styles.nftPreviewImage],
    )

    const renderNft = useMemo(() => {
        return (
            <BaseView style={styles.nftCollectionNameBarRadius}>
                {nft.mediaType === NFTMediaType.IMAGE && (
                    <NFTImage
                        uri={nft.image}
                        // @ts-ignore
                        style={styles.nftPreviewImage}
                    />
                )}

                {nft.mediaType === NFTMediaType.VIDEO &&
                    PlatformUtils.isIOS() && (
                        <BaseView style={styles.nftPreviewImage}>
                            <Video
                                usePoster
                                ref={video}
                                shouldPlay={false}
                                style={styles.nftPreviewImage}
                                source={{ uri: nft.image }}
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                isMuted
                            />
                        </BaseView>
                    )}

                {/* On Android devices with low RAM showing video previews causes rendering overload and crashes */}
                {nft.mediaType === NFTMediaType.VIDEO &&
                    PlatformUtils.isAndroid() &&
                    renderNFTStaticImage()}

                {nft.mediaType === NFTMediaType.UNKNOWN && (
                    <NFTImage
                        uri={NFTPlaceholder}
                        // @ts-ignore
                        style={styles.nftPreviewImage}
                    />
                )}

                {isPendingTx && (
                    <BaseView
                        w={43}
                        style={styles.nftPendingLabel}
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
                    style={styles.nftCollectionNameBar}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between">
                    <BaseText color={COLORS.WHITE} numberOfLines={1} w={80}>
                        #{nft.tokenId}
                    </BaseText>
                </BaseView>
            </BaseView>
        )
    }, [
        nft.mediaType,
        nft.image,
        nft.tokenId,
        styles.nftCollectionNameBarRadius,
        styles.nftPreviewImage,
        styles.nftPendingLabel,
        styles.nftCollectionNameBar,
        renderNFTStaticImage,
        isPendingTx,
        LL,
    ])

    return nft.updated ? (
        <TouchableOpacity
            activeOpacity={0.6}
            // Workaround -> https://github.com/mpiannucci/react-native-context-menu-view/issues/60#issuecomment-1453864955
            onLongPress={() => {}}
            onPress={onNftPress}
            style={[
                styles.nftContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                },
            ]}>
            {renderNft}
        </TouchableOpacity>
    ) : (
        <SkeletonContent
            containerStyle={[
                styles.nftContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                },
            ]}
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            // @ts-ignore
            layout={[{ ...styles.nftPreviewImage, opacity: 0.1 }]}
            isLoading={true}
        />
    )
})

const baseStyles = () =>
    StyleSheet.create({
        nftContainer: {
            flexWrap: "wrap",
            flexDirection: "row",
            justifyContent: "space-between",
            marginLeft: 20,
            marginRight: 20,
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
