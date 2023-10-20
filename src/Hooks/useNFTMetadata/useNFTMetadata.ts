import axios from "axios"
import { usePersistedCache } from "~Components/Providers"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { NFTMetadata } from "~Model"
import { getNFTMetadataArweave, getNFTMetadataIpfs } from "~Networking"
import { debug, warn } from "~Utils"

export const useNFTMetadata = () => {
    const { metadataCache } = usePersistedCache()

    const fetchMetadata = async (
        uri: string,
    ): Promise<NFTMetadata | undefined> => {
        try {
            const protocol = uri?.split(":")[0].trim()
            let tokenMetadata: NFTMetadata | undefined

            switch (protocol) {
                case URIProtocol.IPFS:
                case URIProtocol.ARWEAVE: {
                    const cachedData = metadataCache?.getItem(uri)
                    if (cachedData) {
                        debug(`Using cached metadata for ${uri}`)
                        return cachedData
                    }

                    debug(`Fetching metadata for ${uri}`)
                    const retrievedData =
                        URIProtocol.IPFS === protocol
                            ? await getNFTMetadataIpfs(uri)
                            : await getNFTMetadataArweave(uri)

                    metadataCache?.setItem(uri, retrievedData)
                    tokenMetadata = retrievedData
                    break
                }

                case URIProtocol.HTTPS:
                case URIProtocol.HTTP: {
                    debug(`Fetching metadata for ${uri}`)
                    tokenMetadata =
                        (
                            await axios.get<NFTMetadata>(uri, {
                                timeout: NFT_AXIOS_TIMEOUT,
                            })
                        )?.data ?? undefined
                    break
                }

                default:
                    warn(
                        `Unable to detect protocol ${protocol} for metadata URI ${uri}`,
                    )
                    return undefined
            }
            // transform all metadata keys to lowercase avoiding case sensitive issues
            return (
                tokenMetadata &&
                (Object.keys(tokenMetadata).reduce((acc: any, key) => {
                    acc[key.toLowerCase()] =
                        tokenMetadata?.[key as keyof NFTMetadata]
                    return acc
                }, {}) as NFTMetadata)
            )
        } catch (e) {
            warn(`Error fetching metadata ${uri}`, e)
        }
    }

    return {
        fetchMetadata,
    }
}
