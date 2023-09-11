import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import {
    BaseView,
    BaseText,
    NFTTransferCardSkeleton,
    NFTMedia,
} from "~Components"
import { useNFTInfo, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ColorThemeType } from "~Constants"

type Props = {
    collectionAddress: string
    tokenId: string
}

export const NFTTransferCard = ({ collectionAddress, tokenId }: Props) => {
    const { isMediaLoading, tokenMetadata, collectionName } = useNFTInfo(
        tokenId,
        collectionAddress,
    )

    const { styles, theme } = useThemedStyles(baseStyles)

    const { LL } = useI18nContext()

    const validatedCollectionName = useMemo(() => {
        if (!collectionName) return LL.UNKNOWN_COLLECTION()

        return collectionName.length > 13
            ? `${collectionName.slice(0, 12)}...`
            : collectionName
    }, [LL, collectionName])

    const validatedTokenId = useMemo(() => {
        return tokenId.length > 13 ? `${tokenId.slice(0, 12)}...` : tokenId
    }, [tokenId])

    const renderMedia = useMemo(() => {
        if (isMediaLoading) return <NFTTransferCardSkeleton />

        return (
            <NFTMedia
                uri={tokenMetadata?.image ?? ""}
                styles={styles.nftImage}
            />
        )
    }, [isMediaLoading, styles.nftImage, tokenMetadata])

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
                                    #{validatedTokenId}
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
