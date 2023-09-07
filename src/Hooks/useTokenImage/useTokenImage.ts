import { useCallback } from "react"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { getTokenImageArweave } from "~Networking/NFT/getTokenImageArweave"
import { getTokenImageIpfs } from "~Networking/NFT/getTokenImageIpfs"
import Cache from "~Storage/Cache/ImageCache"

import { URIUtils, debug, warn } from "~Utils"

export const useTokenImage = () => {
    const fetchImage = useCallback(async (uri: string) => {
        try {
            const protocol = uri?.split(":")[0].trim()

            switch (protocol) {
                case URIProtocol.DATA:
                case URIProtocol.HTTPS: {
                    return uri
                }

                case URIProtocol.IPFS:
                case URIProtocol.ARWEAVE: {
                    const cachedData = Cache.getItem(uri)
                    if (cachedData) {
                        debug(`Using cached image for ${uri}`)
                        return cachedData
                    }

                    debug(`Fetching image for ${uri}`)
                    const imageStr = URIProtocol.IPFS
                        ? await getTokenImageIpfs(uri)
                        : await getTokenImageArweave(uri)

                    Cache.setItem(uri, imageStr)
                    return imageStr
                }

                default:
                    warn(`Unable to detect protocol for image URI ${uri}`)
            }
        } catch (e) {
            warn(`Error fetching image ${uri}`, e)
        }
        return URIUtils.convertUriToUrl(uri)
    }, [])

    return {
        fetchImage,
    }
}
