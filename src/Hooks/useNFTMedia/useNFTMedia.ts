import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { NFTMediaType, NFTMedia } from "~Model"
import { getNFTMediaArweave } from "~Networking/NFT/getNFTMediaArweave"
import { getNFTMediaIpfs } from "~Networking/NFT/getNFTMediaIpfs"

import { MediaUtils, URIUtils, debug, warn } from "~Utils"
import { useCallback } from "react"
import { usePersistedCache } from "~Components/Providers/PersistedCacheProvider"

export const useNFTMedia = () => {
    const { mediaCache } = usePersistedCache()
    const fetchMedia = useCallback(
        async (uri: string): Promise<NFTMedia> => {
            try {
                const protocol = uri?.split(":")[0].trim()

                switch (protocol) {
                    case URIProtocol.DATA:
                    case URIProtocol.HTTPS:
                    case URIProtocol.HTTP: {
                        const mimeType = await MediaUtils.resolveMimeTypeFromUri(uri)
                        const mediaType = MediaUtils.resolveMediaTypeFromMimeType(mimeType)
                        return {
                            image: uri,
                            mime: mimeType,
                            mediaType,
                        }
                    }

                    case URIProtocol.IPFS:
                    case URIProtocol.ARWEAVE: {
                        const cachedData = mediaCache?.getItem(uri)
                        if (cachedData) {
                            debug(`Using cached media for ${uri}`)
                            return cachedData
                        }

                        debug(`Fetching media for ${uri}`)
                        const media =
                            URIProtocol.IPFS === protocol ? await getNFTMediaIpfs(uri) : await getNFTMediaArweave(uri)

                        mediaCache?.setItem(uri, media)

                        return media
                    }

                    default:
                        warn(`Unable to detect protocol ${protocol} for image URI ${uri}`)
                }
            } catch (e) {
                warn(`Error fetching image ${uri}`, e)
            }
            return {
                image: URIUtils.convertUriToUrl(uri),
                mime: "image/png",
                mediaType: NFTMediaType.IMAGE,
            }
        },
        [mediaCache],
    )

    return {
        fetchMedia,
    }
}
