import {
    getImageUrlArweave,
    getImageUrlIpfs,
    getTokenMetaArweave,
    getTokenMetaIpfs,
} from "~Networking"
import { error, info } from "~Utils"
import { TokenMetadata } from "~Model"
import axios from "axios"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"

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
        let protocol = uri?.split(":")[0]

        switch (protocol) {
            case URIProtocol.IPFS: {
                const tokenMetadata = await getTokenMetaIpfs(uri)
                const { imageUrl, imageType } = await getImageData(
                    getImageUrlIpfs(tokenMetadata.image),
                )

                return { tokenMetadata, imageUrl, imageType }
            }

            case URIProtocol.ARWEAVE: {
                const tokenMetadata = await getTokenMetaArweave(uri)
                const { imageUrl, imageType } = await getImageData(
                    await getImageUrlArweave(tokenMetadata.image),
                )

                return { tokenMetadata, imageUrl, imageType }
            }

            case URIProtocol.HTTPS: {
                try {
                    const tokenMetadata = await axios.get<TokenMetadata>(uri, {
                        timeout: NFT_AXIOS_TIMEOUT,
                    })

                    const { imageUrl, imageType } = await getImageData(
                        tokenMetadata.data.image,
                    )

                    return {
                        tokenMetadata: tokenMetadata.data,
                        imageUrl,
                        imageType,
                    }
                } catch (e) {
                    info("fetchMetadata -- HTTPS", e)
                    throw e
                }
            }

            default:
                return undefined
        }
    } catch (e) {
        error(e)
    }
}

export const fetchWithTimeout = async (
    resource: RequestInfo,
    options = {},
    timeout?: number,
) => {
    const controller = new AbortController()
    const id = setTimeout(
        () => controller.abort(),
        timeout ?? NFT_AXIOS_TIMEOUT,
    )

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
    })

    clearTimeout(id)

    return response
}

const getImageData = async (imageUrl: string) => {
    const response = await fetchWithTimeout(imageUrl)
    const blob = await response.blob()
    return {
        imageUrl,
        imageType: blob.type,
    }
}
