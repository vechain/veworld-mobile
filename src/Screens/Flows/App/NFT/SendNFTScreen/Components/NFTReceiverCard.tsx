import React, { useMemo } from "react"
import { Animated, StyleSheet } from "react-native"
import { BaseText, BaseView, NFTMedia, NFTTransferCardSkeleton } from "~Components"
import { DetailsContainer } from "~Components/Reusable/Send/03-SummarySend/Components/DetailsContainer"
import { useNFTSendContext } from "~Components/Reusable/Send"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { useI18nContext } from "~i18n"

const PADDING = 16
const GAP = 12

export const NFTReceiverCard = () => {
    const { flowState } = useNFTSendContext()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const collectible = useCollectibleDetails({
        address: flowState.contractAddress,
        tokenId: flowState.tokenId,
    })

    const isLoading = !collectible.collectionName

    const validatedCollectionName = useMemo(() => {
        if (!collectible.collectionName) return LL.UNKNOWN_COLLECTION()

        return collectible.collectionName.length > 13
            ? `${collectible.collectionName.slice(0, 12)}...`
            : collectible.collectionName
    }, [LL, collectible.collectionName])

    const validatedTokenId = useMemo(() => {
        const tokenId = flowState.tokenId ?? ""
        return tokenId.length > 13 ? `${tokenId.slice(0, 12)}...` : tokenId
    }, [flowState.tokenId])

    const renderMedia = useMemo(() => {
        if (isLoading) return <NFTTransferCardSkeleton />

        return <NFTMedia uri={collectible.image ?? ""} styles={styles.nftImage} />
    }, [isLoading, collectible.image])

    return (
        <Animated.View>
            <DetailsContainer>
                <BaseView flexDirection="row" py={PADDING} px={PADDING}>
                    <BaseView pr={16}>{renderMedia}</BaseView>
                    {!isLoading && (
                        <BaseView flexDirection="column" flex={1} justifyContent="center">
                            <BaseView pb={GAP}>
                                <BaseText
                                    typographyFont="bodySemiBold"
                                    color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                                    pb={4}>
                                    {LL.COLLECTION_NAME()}
                                </BaseText>
                                <BaseText
                                    typographyFont="bodySemiBold"
                                    color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                                    {validatedCollectionName}
                                </BaseText>
                            </BaseView>
                            <BaseView>
                                <BaseText
                                    typographyFont="bodySemiBold"
                                    color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                                    pb={4}>
                                    {LL.TOKEN_ID()}
                                </BaseText>
                                <BaseText
                                    typographyFont="bodySemiBold"
                                    color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                                    #{validatedTokenId}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    )}
                </BaseView>
                <DetailsContainer.TokenReceiver address={flowState.address!} />
            </DetailsContainer>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    nftImage: {
        overflow: "hidden",
        borderRadius: 16,
        width: 120,
        height: 120,
    },
})
