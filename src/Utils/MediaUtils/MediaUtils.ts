import axios from "axios"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import { NFT_MIME_TYPE_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { NFTMediaType } from "~Model"
import { error } from "~Utils/Logger"
import URIUtils from "~Utils/URIUtils"

const isValidMimeType = (mime: string, type: NFTMediaType[]) => {
    const found = type.find(t => {
        if (mime?.split("/")[0] === t) {
            return true
        }
    })

    return !!found
}

const resolveMimeType = async (resource: string) => {
    try {
        // If it's a data URI parse from the string
        if (resource.startsWith("data:")) {
            const mime = resource.split(";")[0].split(":")[1]
            return mime
        }

        const res = await axios.head(URIUtils.convertUriToUrl(resource), {
            timeout: NFT_MIME_TYPE_AXIOS_TIMEOUT,
        })

        const contentType = res.headers["content-type"]
        return contentType ?? "image/png"
    } catch (err) {
        error(`Failed to resolve mime type for ${resource}`, err)
    }
    return "image/png"
}

const resolveMediaType = async (
    imageUrl: string,
    mimeType?: string,
): Promise<NFTMediaType> => {
    const mime = mimeType ?? (await resolveMimeType(imageUrl))

    if (isValidMimeType(mime, [NFTMediaType.IMAGE])) return NFTMediaType.IMAGE
    else if (isValidMimeType(mime, [NFTMediaType.VIDEO]))
        return NFTMediaType.VIDEO

    return NFTMediaType.UNKNOWN
}

const isDefaultImage = (image: string): boolean =>
    image === NFTPlaceholderDark || image === NFTPlaceHolderLight

export default {
    resolveMediaType,
    resolveMimeType,
    isDefaultImage,
}
