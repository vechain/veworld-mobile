import { StyleSheet } from "react-native"
import React, { useRef } from "react"
import { NFTMediaType, NonFungibleToken } from "~Model"
import { BaseView, NFTImage } from "~Components"
import { MediaUtils } from "~Utils"
import { ResizeMode, Video } from "expo-av"
import { NFTPlaceholder } from "~Assets"

type Props = {
    nft: NonFungibleToken
}

export const NFTRecapView = ({ nft }: Props) => {
    const video = useRef(null)

    return (
        <BaseView style={baseStyles.nftCollectionNameBarRadius}>
            {MediaUtils.getMime(nft.mimeType, [NFTMediaType.IMAGE]) && (
                <NFTImage
                    uri={nft.mimeType}
                    style={baseStyles.nftPreviewImage}
                />
            )}

            {MediaUtils.getMime(nft.mimeType, [NFTMediaType.VIDEO]) && (
                <BaseView style={baseStyles.nftPreviewImage}>
                    <Video
                        PosterComponent={() => (
                            <NFTImage
                                uri={NFTPlaceholder}
                                style={baseStyles.nftPreviewImage}
                            />
                        )}
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

            {!MediaUtils.getMime(nft.mimeType, [NFTMediaType.IMAGE]) &&
                !MediaUtils.getMime(nft.mimeType, [NFTMediaType.VIDEO]) && (
                    <NFTImage
                        uri={NFTPlaceholder}
                        style={baseStyles.nftPreviewImage}
                    />
                )}
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    nftPreviewImage: {
        width: 130,
        height: 130,
        borderRadius: 16,
    },

    nftCollectionNameBarRadius: {
        overflow: "hidden",
        borderRadius: 16,
    },
})
