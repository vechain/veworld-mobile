import React, { useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { SCREEN_WIDTH, COLORS } from "~Constants"
import { BaseText, BaseView, NFTImage } from "~Components"
import { Video, ResizeMode } from "expo-av"
import { NFTPlaceholder } from "~Assets"
import { useMimeTypeResolver } from "~Hooks/useMimeTypeResolver"
import { NFTMediaType } from "~Model"

type Props = {
    uri: string
    mime: string
    name: string
    tokenId: string
}

export const NFTDetailImage = ({ uri, mime, name, tokenId }: Props) => {
    const theme = useTheme()
    const mediaType = useMimeTypeResolver({
        imageUrl: uri,
        mimeType: mime,
    })
    const video = useRef(null)

    const renderMedia = useMemo(() => {
        if (mediaType === NFTMediaType.IMAGE)
            return <NFTImage uri={uri} style={baseStyles.nftImage} />

        if (mediaType === NFTMediaType.VIDEO)
            return (
                <BaseView style={baseStyles.nftImage}>
                    <Video
                        PosterComponent={() => (
                            <NFTImage
                                isNFT={true}
                                uri={NFTPlaceholder}
                                style={baseStyles.nftImage}
                            />
                        )}
                        usePoster
                        ref={video}
                        shouldPlay
                        useNativeControls
                        style={baseStyles.nftImage}
                        source={{ uri: uri }}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                    />
                </BaseView>
            )

        return (
            <NFTImage
                uri={NFTPlaceholder}
                style={baseStyles.nftImage}
                isNFT={true}
            />
        )
    }, [mediaType, uri])

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
                        {name}
                    </BaseText>
                    <BaseText color={COLORS.WHITE}># {tokenId}</BaseText>
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
