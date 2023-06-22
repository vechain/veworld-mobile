import {
    getImageUrlArweave,
    getImageUrlIpfs,
    getTokenMetaArweave,
    getTokenMetaIpfs,
} from "~Networking"
import { error } from "~Utils"
import { TokenMetadata } from "~Model"
import axios from "axios"

enum URIProtocol {
    IPFS = "ipfs",
    ARWEAVE = "ar",
    HTTPS = "https",
}

export type NFTMeta = {
    tokenMetadata: TokenMetadata
    imageUrl: string
    imageType: Blob["type"]
}

export const fetchMetadata = async (
    uri: string,
): Promise<NFTMeta | undefined> => {
    try {
        let protocol = uri.split(":")[0]

        switch (protocol) {
            case URIProtocol.IPFS: {
                const tokenMetadata = await getTokenMetaIpfs(uri)
                const imageUrl = getImageUrlIpfs(tokenMetadata.image ?? "")
                const response = await fetch(imageUrl)
                const blob = await response.blob()

                return { tokenMetadata, imageUrl, imageType: blob.type }
            }

            case URIProtocol.ARWEAVE: {
                const tokenMetadata = await getTokenMetaArweave(uri)
                const imageUrl = await getImageUrlArweave(tokenMetadata.image)
                const response = await fetch(imageUrl)
                const blob = await response.blob()

                return { tokenMetadata, imageUrl, imageType: blob.type }
            }

            case URIProtocol.HTTPS: {
                const tokenMetadata = await axios.get<TokenMetadata>(uri)
                const response = await fetch(tokenMetadata.data.image)
                const blob = await response.blob()

                return {
                    tokenMetadata: tokenMetadata.data,
                    imageUrl: tokenMetadata.data.image,
                    imageType: blob.type,
                }
            }

            default:
                return undefined
        }
    } catch (e) {
        error(e)
    }
}
