import { useEffect, useState } from "react"
import { resolveMimeType } from "~Hooks/useNft/Helpers"
import { NFTMediaType } from "~Model"
import { MediaUtils } from "~Utils"

type Props = {
    imageUrl: string
    mimeType?: string
}

export const useMimeTypeResolver = ({ imageUrl, mimeType }: Props) => {
    const [isImage, setIsImage] = useState(false)
    const [isVideo, setIsVideo] = useState(false)

    useEffect(() => {
        if (mimeType !== undefined && mimeType !== "") {
            setIsImage(
                MediaUtils.isValidMimeType(mimeType, [NFTMediaType.IMAGE]),
            )
            setIsVideo(
                MediaUtils.isValidMimeType(mimeType, [NFTMediaType.VIDEO]),
            )
        } else {
            // Resolve mime type
            resolveMimeType(imageUrl).then(mime => {
                setIsImage(
                    MediaUtils.isValidMimeType(mime, [NFTMediaType.IMAGE]),
                )
                setIsVideo(
                    MediaUtils.isValidMimeType(mime, [NFTMediaType.VIDEO]),
                )
            })
        }
    }, [mimeType, imageUrl])

    return { isImage, isVideo }
}
