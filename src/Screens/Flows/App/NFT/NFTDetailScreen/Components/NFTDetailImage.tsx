import React, { useRef } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { SCREEN_WIDTH, COLORS } from "~Constants"
import { BaseImage, BaseText, BaseView } from "~Components"
import { MediaUtils } from "~Utils"
import { NFTMediaType } from "~Model"
import { Video, ResizeMode } from "expo-av"
import { NFTPlaceholder } from "~Assets"

type Props = {
    uri: string
    mime: string
    name: string
    tokenId: string
}

export const NFTDetailImage = ({ uri, mime, name, tokenId }: Props) => {
    const theme = useTheme()
    const video = useRef(null)

    return (
        <BaseView>
            <BaseView style={baseStyles.nftImage}>
                {MediaUtils.getMime(mime, [NFTMediaType.IMAGE]) && (
                    <BaseImage uri={uri} style={baseStyles.nftImage} />
                )}

                {MediaUtils.getMime(mime, [
                    NFTMediaType.VIDEO,
                    NFTMediaType.TEXT,
                ]) && (
                    <BaseView style={baseStyles.nftImage}>
                        <Video
                            PosterComponent={() => (
                                <BaseImage
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
                            isMuted
                        />
                    </BaseView>
                )}
            </BaseView>

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
        width: SCREEN_WIDTH - 40,
        height: SCREEN_WIDTH - 40,
        overflow: "hidden",
    },

    nftContainer: {
        height: 72,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
})
