import axios from "axios"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { NFTMetadata } from "~Model"
import { getNFTMetadataArweave, getNFTMetadataIpfs } from "~Networking"
import { TokenMetadataCache as cache } from "~Storage/PersistedCache"
import { debug, warn } from "~Utils"

export const useNFTMetadata = () => {
    const fetchMetadata = async (
        uri: string,
    ): Promise<NFTMetadata | undefined> => {
        try {
            const protocol = uri?.split(":")[0].trim()

            switch (protocol) {
                case URIProtocol.IPFS:
                case URIProtocol.ARWEAVE: {
                    const cachedData = cache?.getItem(uri)
                    if (cachedData) {
                        debug(`Using cached metadata for ${uri}`)
                        return cachedData
                    }

                    debug(`Fetching metadata for ${uri}`)
                    const retrievedData = URIProtocol.IPFS
                        ? await getNFTMetadataIpfs(uri)
                        : await getNFTMetadataArweave(uri)

                    cache?.setItem(uri, retrievedData)
                    return retrievedData
                }

                case URIProtocol.HTTPS:
                case URIProtocol.HTTP: {
                    debug(`Fetching metadata for ${uri}`)
                    return (
                        (
                            await axios.get<NFTMetadata>(uri, {
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
