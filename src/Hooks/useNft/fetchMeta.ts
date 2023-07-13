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
import ReactNativeBlobUtil, { PolyfillBlob } from "react-native-blob-util"
import { Methods } from "~Constants"

enum URIProtocol {
    IPFS = "ipfs",
    ARWEAVE = "ar",
    HTTPS = "https",
}

export type NFTMeta = {
    tokenMetadata: TokenMetadata
    imageUrl: string
    imageType: string
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

interface CustomPolyfillBlob extends PolyfillBlob {
    type?: string
}

export const fetchImageWithTimeout = async (
    resource: string,
    timeout?: number,
) => {
    const controller = new AbortController()

    const id = setTimeout(
        () => controller.abort(),
        timeout ?? NFT_AXIOS_TIMEOUT,
    )

    const res = await ReactNativeBlobUtil.config({
        timeout: timeout ?? NFT_AXIOS_TIMEOUT,
    }).fetch(Methods.GET, resource)

    clearTimeout(id)

    let status = res.info().status
    if (status === 200) {
        let blob: CustomPolyfillBlob = await res.blob(res.type, 0)
        return blob.type ?? "image/png"
    } else {
        return "image/png"
    }
}

const getImageData = async (imageUrl: string) => {
    const mime = await fetchImageWithTimeout(imageUrl)
    return {
        imageUrl: imageUrl,
        imageType: mime,
    }
}
