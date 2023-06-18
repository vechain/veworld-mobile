import {
    getImageUrlArweave,
    getImageUrlIpfs,
    getTokenMetaArweave,
    getTokenMetaIpfs,
} from "~Networking"
import { error } from "~Utils"
import { TokenMetadata } from "~Model"

enum URIProtocol {
    IPFS = "ipfs",
    ARWEAVE = "ar",
}

export type NFTMeta = {
    tokenMetadata: TokenMetadata
    imageUrl: string
}

export const fetchMetadata = async (
    uri: string,
): Promise<NFTMeta | undefined> => {
    try {
        const protocol = uri.split(":")[0]

        switch (protocol) {
            case URIProtocol.IPFS: {
                const tokenMetadata = await getTokenMetaIpfs(uri)
                const imageUrl = getImageUrlIpfs(tokenMetadata.image ?? "")
                return { tokenMetadata, imageUrl }
            }

            case URIProtocol.ARWEAVE: {
                const tokenMetadata = await getTokenMetaArweave(uri)
                const imageUrl = await getImageUrlArweave(uri)
                return { tokenMetadata, imageUrl }
            }

            default:
                return undefined
        }
    } catch (e) {
        error(e)
    }
}
