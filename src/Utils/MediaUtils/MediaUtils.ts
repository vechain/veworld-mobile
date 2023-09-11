import axios from "axios"
import { NFTPlaceholderDark, NFTPlaceHolderLight } from "~Assets"
import { NFT_MIME_TYPE_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { NFTMediaType } from "~Model"
import { warn } from "~Utils/Logger"
import URIUtils from "~Utils/URIUtils"

const isValidMimeType = (mime: string, type: NFTMediaType[]) => {
    const found = type.find(t => {
        if (mime?.split("/")[0] === t) {
            return true
        }
    })

    return !!found
}

export const resolveMimeTypeFromRawData = (buffer: Buffer): string | null => {
    // Check for minimum length needed for TIFF, which is the longest magic number
    if (buffer.length < 4) {
        return null
    }

    const jpgMagic = Buffer.from([0xff, 0xd8, 0xff])
    const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47])
    const gifMagic = Buffer.from([0x47, 0x49, 0x46, 0x38])
    const bmpMagic = Buffer.from([0x42, 0x4d])
    const tiffLittleEndianMagic = Buffer.from([0x49, 0x49, 0x2a, 0x00])
    const tiffBigEndianMagic = Buffer.from([0x4d, 0x4d, 0x00, 0x2a])
    const webpMagic = Buffer.from([0x52, 0x49, 0x46, 0x46])

    const magicBytes4 = buffer.subarray(0, 4)
    const magicBytes2 = buffer.subarray(0, 2)

    if (Buffer.from(magicBytes2).equals(bmpMagic)) {
        return "image/bmp"
    }
    if (
        Buffer.from(magicBytes4).equals(tiffLittleEndianMagic) ||
        Buffer.from(magicBytes4).equals(tiffBigEndianMagic)
    ) {
        return "image/tiff"
    }
    if (
        Buffer.from(magicBytes4).equals(webpMagic) &&
        buffer.subarray(8, 12).toString() === "WEBP"
    ) {
        return "image/webp"
    }

    // The previous checks
    if (Buffer.from(magicBytes4.subarray(0, 3)).equals(jpgMagic)) {
        return "image/jpeg"
    }
    if (Buffer.from(magicBytes4).equals(pngMagic)) {
        return "image/png"
    }
    if (Buffer.from(magicBytes4).equals(gifMagic)) {
        return "image/gif"
    }

    // Check for SVG
    const initialString = buffer.toString("utf-8", 0, 100) // Convert the first 100 bytes to a UTF-8 string
    if (initialString.includes("<svg")) {
        return "image/svg+xml"
    }

    return null
}

const resolveMimeTypeFromUri = async (resource: string) => {
    try {
        // If it's a data URI parse from the string
        if (resource.startsWith("data:")) {
            return resource.split(";")[0].split(":")[1]
        }

        const res = await axios.head(URIUtils.convertUriToUrl(resource), {
            timeout: NFT_MIME_TYPE_AXIOS_TIMEOUT,
        })

        const contentType = res.headers["content-type"]
        return contentType ?? "image/png"
    } catch (err) {
        warn(`Failed to resolve mime type for ${resource}`, err)
    }
    return "image/png"
}

const resolveMediaTypeFromMimeType = (mimeType: string): NFTMediaType => {
    if (isValidMimeType(mimeType, [NFTMediaType.IMAGE]))
        return NFTMediaType.IMAGE
    else if (isValidMimeType(mimeType, [NFTMediaType.VIDEO]))
        return NFTMediaType.VIDEO

    return NFTMediaType.UNKNOWN
}

const resolveMediaTypeFromUri = async (
    imageUrl: string,
): Promise<NFTMediaType> => {
    const mime = await resolveMimeTypeFromUri(imageUrl)

    return resolveMediaTypeFromMimeType(mime)
}

const isDefaultImage = (image: string): boolean =>
    image === NFTPlaceholderDark || image === NFTPlaceHolderLight

export default {
    isValidMimeType,
    resolveMimeTypeFromUri,
    resolveMimeTypeFromRawData,
    resolveMediaTypeFromUri,
    resolveMediaTypeFromMimeType,
    isDefaultImage,
}
