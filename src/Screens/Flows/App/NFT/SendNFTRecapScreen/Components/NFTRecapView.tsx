import { StyleSheet } from "react-native"
import React, { useEffect, useRef, useState } from "react"
import { NFTMediaType, NonFungibleToken } from "~Model"
import { BaseView, NFTImage } from "~Components"
import { MediaUtils } from "~Utils"
import { ResizeMode, Video } from "expo-av"
import { NFTPlaceholder } from "~Assets"
import { resolveMimeType } from "~Hooks/useNft/Helpers"

type Props = {
    nft: NonFungibleToken
}

export const NFTRecapView = ({ nft }: Props) => {
    const [isImage, setIsImage] = useState(false)
    const [isVideo, setIsVideo] = useState(false)
    const video = useRef(null)

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
