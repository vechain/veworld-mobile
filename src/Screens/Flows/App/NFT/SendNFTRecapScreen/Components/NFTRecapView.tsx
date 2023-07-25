import { StyleSheet } from "react-native"
import React, { useRef } from "react"
import { NonFungibleToken } from "~Model"
import { BaseView, NFTImage } from "~Components"
import { ResizeMode, Video } from "expo-av"
import { NFTPlaceholder } from "~Assets"
import { useMimeTypeResolver } from "~Hooks/useMimeTypeResolver"

type Props = {
    nft: NonFungibleToken
}

export const NFTRecapView = ({ nft }: Props) => {
    const { isImage, isVideo } = useMimeTypeResolver({
        imageUrl: nft.image,
        mimeType: nft.mimeType,
    })
    const video = useRef(null)

    return (
        <BaseView style={baseStyles.nftCollectionNameBarRadius}>
            {isImage && (
                <NFTImage uri={nft.image} style={baseStyles.nftPreviewImage} />
            )}

            {isVideo && (
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

            {!isImage && !isVideo && (
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
