import axios from "axios"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { useTokenImage } from "~Hooks/useTokenImage"
import { TokenMetadata } from "~Model"
import { getTokenMetaArweave, getTokenMetaIpfs } from "~Networking"
import Cache from "~Storage/PersistedCache/MetadataCache"
import { debug, warn } from "~Utils"

export const useTokenMetadata = () => {
    const { fetchImage } = useTokenImage()

    const fetchMetadata = async (uri: string) => {
        try {
            const protocol = uri?.split(":")[0].trim()

            switch (protocol) {
                case URIProtocol.IPFS:
                case URIProtocol.ARWEAVE: {
                    const cachedData = Cache.getItem(uri)
                    if (cachedData) {
                        debug(`Using cached metadata for ${uri}`)
                        return cachedData
                    }

                    debug(`Fetching metadata for ${uri}`)
                    const retrievedData = URIProtocol.IPFS
                        ? await getTokenMetaIpfs(uri)
                        : await getTokenMetaArweave(uri)

                    const image = await fetchImage(retrievedData?.image)
                    retrievedData.image = image.image
                    retrievedData.mediaType = image.mediaType

                    Cache.setItem(uri, retrievedData)
                    return retrievedData
                }

                case URIProtocol.HTTPS:
                case URIProtocol.HTTP: {
                    debug(`Fetching metadata for ${uri}`)
                    return (
                        (
                            await axios.get<TokenMetadata>(uri, {
                                timeout: NFT_AXIOS_TIMEOUT,
                            })
                        )?.data ?? undefined
                    )
                }

                default:
                    warn(`Unable to detect protocol for metadata URI ${uri}`)
                    return undefined
            }
        } catch (e) {
            warn(`Error fetching metadata ${uri}`, e)
        }
    }

    return {
        fetchMetadata,
    }
}
