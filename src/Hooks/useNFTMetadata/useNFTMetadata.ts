import axios from "axios"
import { ERROR_EVENTS } from "~Constants"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { NFTMetadata } from "~Model"
import { getNFTMetadataArweave, getNFTMetadataIpfs } from "~Networking"
import { debug, warn } from "~Utils"

export const useNFTMetadata = () => {
    const fetchMetadata = async (uri: string): Promise<NFTMetadata | undefined> => {
        try {
            const protocol = uri?.split(":")[0].trim()
            let tokenMetadata: NFTMetadata | undefined
            debug(ERROR_EVENTS.NFT, `Fetching metadata for ${uri}. Protocol: ${protocol}`)

            switch (protocol) {
                case URIProtocol.IPFS: {
                    tokenMetadata = await getNFTMetadataIpfs(uri)
                    break
                }
                case URIProtocol.ARWEAVE: {
                    tokenMetadata = await getNFTMetadataArweave(uri)
                    break
                }

                case URIProtocol.HTTPS:
                case URIProtocol.HTTP: {
                    debug(ERROR_EVENTS.NFT, `Fetching metadata for ${uri}`)
                    tokenMetadata =
                        (
                            await axios.get<NFTMetadata>(uri, {
                                timeout: NFT_AXIOS_TIMEOUT,
                            })
                        )?.data ?? undefined
                    break
                }

                default:
                    warn(ERROR_EVENTS.NFT, `Unable to detect protocol ${protocol} for metadata URI ${uri}`)
                    return undefined
            }
            // transform all metadata keys to lowercase avoiding case sensitive issues
            return (
                tokenMetadata &&
                (Object.keys(tokenMetadata).reduce((acc: any, key) => {
                    acc[key.toLowerCase()] = tokenMetadata?.[key as keyof NFTMetadata]
                    return acc
                }, {}) as NFTMetadata)
            )
        } catch (e) {
            warn(ERROR_EVENTS.NFT, `Error fetching metadata ${uri}`, e)
        }
    }

    return {
        fetchMetadata,
    }
}
