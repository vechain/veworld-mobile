import axios from "axios"
import { ERROR_EVENTS } from "~Constants"
import { MAX_IMAGE_SIZE } from "~Constants/Constants/NFT"
import { NFTMedia } from "~Model"
import { MediaUtils, URIUtils, debug } from "~Utils"

export const getNFTMediaIpfs = async (uri: string): Promise<NFTMedia> => {
    try {
        const response = await axios.get(URIUtils.convertUriToUrl(uri), {
            responseType: "blob",
            maxContentLength: MAX_IMAGE_SIZE,
            headers: {
                "x-project-id": "veworld-mobile",
            },
        })

        // Check if the MIME type is allowed
        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/tiff",
            "image/webp",
            "image/svg+xml",
        ]
        if (!allowedMimeTypes.includes(response.data.type)) {
            throw new Error(`Unsupported MIME type: ${response.data.type}`)
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(response.data)
            reader.onloadend = () => {
                resolve({
                    image: reader.result as string,
                    mime: response.data.type,
                    mediaType: MediaUtils.resolveMediaTypeFromMimeType(response.data.type),
                })
            }
            reader.onerror = () => {
                reject(Error("Error occurred while reading blob."))
            }
        })
    } catch (err) {
        debug(ERROR_EVENTS.NFT, JSON.stringify(err))
        throw err
    }
}
