import React, { useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { SCREEN_WIDTH, COLORS } from "~Constants"
import { BaseText, BaseView, NFTImage } from "~Components"
import { Video, ResizeMode } from "expo-av"
import { NFTPlaceholder } from "~Assets"
import { NFTMediaType, NonFungibleToken } from "~Model"

type Props = {
    nft: NonFungibleToken
}

export const NFTDetailImage = ({ nft }: Props) => {
    const theme = useTheme()
    const video = useRef(null)

    const renderMedia = useMemo(() => {
        if (nft.mediaType === NFTMediaType.IMAGE)
            return <NFTImage uri={nft.image} style={baseStyles.nftImage} />

        if (nft.mediaType === NFTMediaType.VIDEO)
            return (
                <BaseView style={baseStyles.nftImage}>
                    <Video
                        PosterComponent={() => (
                            <NFTImage
                                uri={NFTPlaceholder}
                                style={baseStyles.nftImage}
                            />
                        )}
                        usePoster
                        ref={video}
                        shouldPlay
                        useNativeControls
                        style={baseStyles.nftImage}
                        source={{ uri: nft.image }}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                    />
                </BaseView>
            )

        return <NFTImage uri={NFTPlaceholder} style={baseStyles.nftImage} />
    }, [nft.image, nft.mediaType])

    return (
        <BaseView>
            <BaseView style={baseStyles.nftImage}>{renderMedia}</BaseView>

            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                px={16}
                py={14}
                style={baseStyles.nftContainer}
                bg={theme.isDark ? COLORS.LIGHT_PURPLE : COLORS.DARK_PURPLE}>
                <BaseView>
                    <BaseText
                        mb={4}
                        numberOfLines={1}
                        typographyFont="subTitleBold"
                        color={COLORS.WHITE}>
                        {nft.name}
                    </BaseText>
                    <BaseText color={COLORS.WHITE}># {nft.tokenId}</BaseText>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    nftImage: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        width: "100%",
        height: SCREEN_WIDTH - 40,
        overflow: "hidden",
    },

    nftContainer: {
        height: 72,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
})
