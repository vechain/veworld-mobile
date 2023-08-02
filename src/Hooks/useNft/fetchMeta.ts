import { getTokenMetaArweave, getTokenMetaIpfs } from "~Networking"
import { warn } from "~Utils"
import { TokenMetadata } from "~Model"
import axios from "axios"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"

enum URIProtocol {
    IPFS = "ipfs",
    ARWEAVE = "ar",
    HTTPS = "https",
}

export const fetchMetadata = async (
    uri: string,
): Promise<TokenMetadata | undefined> => {
    try {
        const protocol = uri?.split(":")[0]

        switch (protocol) {
            case URIProtocol.IPFS: {
                return await getTokenMetaIpfs(uri)
            }

            case URIProtocol.ARWEAVE: {
                return await getTokenMetaArweave(uri)
            }

            case URIProtocol.HTTPS: {
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
