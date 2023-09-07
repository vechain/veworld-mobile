import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { NFTMediaType } from "~Model"
import { getTokenImageArweave } from "~Networking/NFT/getTokenImageArweave"
import { getTokenImageIpfs } from "~Networking/NFT/getTokenImageIpfs"

import { MediaUtils, URIUtils, debug, warn } from "~Utils"

export interface TokenImage {
    image: string
    mime: string
    mediaType: NFTMediaType
}

export const useTokenImage = () => {
    const getImage = async (uri: string) => {
        try {
            const protocol = uri?.split(":")[0].trim()

            switch (protocol) {
                case URIProtocol.DATA:
                case URIProtocol.HTTPS: {
                    return uri
                }

                case URIProtocol.IPFS:
                case URIProtocol.ARWEAVE: {
                    debug(`Fetching image for ${uri}`)
                    const imageStr = URIProtocol.IPFS
                        ? await getTokenImageIpfs(uri)
                        : await getTokenImageArweave(uri)

                    return imageStr
                }

                default:
                    warn(`Unable to detect protocol for image URI ${uri}`)
            }
        } catch (e) {
            warn(`Error fetching image ${uri}`, e)
        }
        return URIUtils.convertUriToUrl(uri)
    }

    const fetchImage = async (uri: string): Promise<TokenImage> => {
        const image = await getImage(uri)
        const mime = await MediaUtils.resolveMimeType(image)
        const mediaType = await MediaUtils.resolveMediaType(image, mime)

        return {
            image,
            mime,
            mediaType,
        }
    }

    return {
        fetchImage,
    }
}
