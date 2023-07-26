import React, { useCallback, useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import {
    BaseView,
    BaseImage,
    BaseText,
    NFTTransferCardSkeleton,
} from "~Components"
import { useNonFungibleTokenInfo, useThemedStyles } from "~Hooks"
import { NFTMediaType } from "~Model"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import { useI18nContext } from "~i18n"
import { ColorThemeType } from "~Constants"
import { ResizeMode, Video } from "expo-av"

type Props = {
    collectionAddress: string
    tokenId: string
}

export const NFTTransferCard = ({ collectionAddress, tokenId }: Props) => {
    const { isMediaLoading, tokenImage, collectionName, tokenMediaType } =
        useNonFungibleTokenInfo(tokenId, collectionAddress)

    const { styles, theme } = useThemedStyles(baseStyles)

    const { LL } = useI18nContext()

    const video = useRef(null)

    const validatedCollectionName = useMemo(() => {
        if (!collectionName) return LL.UNKNOWN_COLLECTION()

        return collectionName.length > 13
            ? `${collectionName.slice(0, 12)}...`
            : collectionName
    }, [LL, collectionName])

    const placeholderImg = useMemo(() => {
        return theme.isDark ? NFTPlaceholderDark : NFTPlaceHolderLight
    }, [theme.isDark])

    const posterComponent = useCallback(() => {
        // @ts-ignore
        return (
            <BaseImage
                uri={placeholderImg}
                // @ts-ignore
                style={styles.nftImage}
            />
        )
    }, [placeholderImg, styles.nftImage])

    const renderMedia = useMemo(() => {
        if (isMediaLoading) return <NFTTransferCardSkeleton />

        if (tokenMediaType === NFTMediaType.IMAGE)
            // @ts-ignore
            return <BaseImage uri={tokenImage} style={styles.nftImage} />

        if (tokenMediaType === NFTMediaType.VIDEO && tokenImage)
            return (
                <BaseView style={styles.nftImage}>
                    <Video
                        PosterComponent={posterComponent}
                        usePoster
                        ref={video}
                        shouldPlay
                        useNativeControls
                        style={styles.nftImage}
                        source={{ uri: tokenImage }}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                    />
                </BaseView>
            )

        // @ts-ignore
        return (
            <BaseImage
                uri={placeholderImg}
                // @ts-ignore
                style={styles.nftImage}
            />
        )
    }, [
        isMediaLoading,
        placeholderImg,
        posterComponent,
        styles.nftImage,
        tokenImage,
        tokenMediaType,
    ])

    return (
        <BaseView style={[styles.container]}>
            <BaseView bg={theme.colors.card} style={styles.view}>
                <BaseView flexDirection="row" p={16}>
                    <BaseView pr={16}>{renderMedia}</BaseView>
                    {!isMediaLoading && (
                        <BaseView flexDirection="column" flex={1}>
                            <BaseView style={styles.nftDetail}>
                                <BaseText
                                    typographyFont="buttonSecondary"
                                    pb={4}>
                                    {LL.COLLECTION_NAME()}
                                </BaseText>
                                <BaseText pb={8} typographyFont="subSubTitle">
                                    {validatedCollectionName}
                                </BaseText>
                            </BaseView>
                            <BaseView pt={8}>
                                <BaseText
                                    typographyFont="buttonSecondary"
                                    pb={4}>
                                    {LL.TOKEN_ID()}
                                </BaseText>
                                <BaseText typographyFont="subSubTitle">
                                    #{tokenId}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    )}
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
        },
        view: {
            borderRadius: 16,
        },
        nftImage: {
            overflow: "hidden",
            borderRadius: 16,
            width: 120,
            height: 120,
        },
        nftDetail: {
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: 0.5,
        },
    })
