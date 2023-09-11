import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { NFTMediaType, NFTMedia } from "~Model"
import { getTokenImageArweave } from "~Networking/NFT/getTokenImageArweave"
import { TokenMediaCache as cache } from "~Storage/PersistedCache"
import { getTokenImageIpfs } from "~Networking/NFT/getTokenImageIpfs"

import { MediaUtils, URIUtils, debug, warn } from "~Utils"
import { useCallback } from "react"

export const useNFTMedia = () => {
    const fetchMedia = useCallback(async (uri: string): Promise<NFTMedia> => {
        try {
            const protocol = uri?.split(":")[0].trim()

            switch (protocol) {
                case URIProtocol.DATA:
                case URIProtocol.HTTPS:
                case URIProtocol.HTTP: {
                    const mimeType = await MediaUtils.resolveMimeTypeFromUri(
                        uri,
                    )
                    const mediaType =
                        MediaUtils.resolveMediaTypeFromMimeType(mimeType)
                    return {
                        image: uri,
                        mime: mimeType,
                        mediaType,
                    }
                }

                case URIProtocol.IPFS:
                case URIProtocol.ARWEAVE: {
                    const cachedData = cache?.getItem(uri)
                    if (cachedData) {
                        debug(`Using cached media for ${uri}`)
                        return cachedData
                    }

                    debug(`Fetching media for ${uri}`)
                    const media = URIProtocol.IPFS
                        ? await getTokenImageIpfs(uri)
                        : await getTokenImageArweave(uri)

                    cache?.setItem(uri, media)

                    return media
                }

                default:
                    warn(`Unable to detect protocol for image URI ${uri}`)
            }
        } catch (e) {
            warn(`Error fetching image ${uri}`, e)
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
