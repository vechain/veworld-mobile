import { NFTMediaType, NFTMedia } from "~Model"

import { MediaUtils, URIUtils, warn } from "~Utils"
import { useCallback } from "react"
import { ERROR_EVENTS } from "~Constants"

export const useNFTMedia = () => {
    const fetchMedia = useCallback(async (uri: string): Promise<NFTMedia> => {
        try {
            const parsedUri = URIUtils.convertUriToUrl(uri)
            const mimeType = await MediaUtils.resolveMimeTypeFromUri(parsedUri)
            const mediaType = MediaUtils.resolveMediaTypeFromMimeType(mimeType)
            return {
                image: parsedUri,
                mime: mimeType,
                mediaType,
            }
        } catch (e) {
            warn(ERROR_EVENTS.NFT, `Error fetching image ${uri}`, e)
        }
        return {
            image: URIUtils.convertUriToUrl(uri),
            mime: "image/png",
            mediaType: NFTMediaType.IMAGE,
        }
    }, [])

    return {
        fetchMedia,
    }
}
