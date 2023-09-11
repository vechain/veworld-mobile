import axios from "axios"
import { MAX_IMAGE_SIZE } from "~Constants/Constants/NFT"
import { TokenMedia } from "~Model"
import { MediaUtils, URIUtils, error } from "~Utils"

export const getTokenImageIpfs = async (uri: string): Promise<TokenMedia> => {
    try {
        const response = await axios.get(URIUtils.convertUriToUrl(uri), {
            responseType: "blob",
            maxContentLength: MAX_IMAGE_SIZE,
        })

        // Check if the MIME type is allowed
        const allowedMimeTypes = [
            "image/jpeg",
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
                    mediaType: MediaUtils.resolveMediaTypeFromMimeType(
                        response.data.type,
                    ),
                })
            }
            reader.onerror = () => {
                reject(Error("Error occurred while reading blob."))
            }
        })
    } catch (err) {
        error("Error fetching the image:", err)
        throw err
    }
}
