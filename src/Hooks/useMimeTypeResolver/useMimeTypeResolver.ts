import { useEffect, useState } from "react"
import { resolveMimeType } from "~Hooks/useNft/Helpers"
import { NFTMediaType } from "~Model"
import { MediaUtils } from "~Utils"

type Props = {
    imageUrl: string
    mimeType?: string
}

export const useMimeTypeResolver = ({
    imageUrl,
    mimeType,
}: Props): NFTMediaType => {
    const [mediaType, setMediaType] = useState<NFTMediaType>(
        NFTMediaType.UNKNOWN,
    )

    useEffect(() => {
        if (mimeType !== undefined && mimeType !== "") {
            if (MediaUtils.isValidMimeType(mimeType, [NFTMediaType.IMAGE]))
                setMediaType(NFTMediaType.IMAGE)
            else if (MediaUtils.isValidMimeType(mimeType, [NFTMediaType.VIDEO]))
                setMediaType(NFTMediaType.VIDEO)
        } else {
            // Resolve mime type
            resolveMimeType(imageUrl).then(mime => {
                if (MediaUtils.isValidMimeType(mime, [NFTMediaType.IMAGE]))
                    setMediaType(NFTMediaType.IMAGE)
                else if (MediaUtils.isValidMimeType(mime, [NFTMediaType.VIDEO]))
                    setMediaType(NFTMediaType.VIDEO)
            })
        }
    }, [mimeType, imageUrl])

    return mediaType
}
