import { queryClient } from "~Api/QueryProvider"
import { ERROR_EVENTS } from "~Constants"
import { MAX_IMAGE_SIZE } from "~Constants/Constants/NFT"
import { NFTMedia } from "~Model"
import { MediaUtils, debug } from "~Utils"
import IPFSUtils from "~Utils/IPFSUtils"

export const getNFTMediaIpfs = async (uri: string): Promise<NFTMedia> => {
    try {
        const response = await queryClient.fetchQuery(
            IPFSUtils.getIpfsQueryKeyOptions<Blob>(uri, { responseType: "blob", maxContentLength: MAX_IMAGE_SIZE }),
        )

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
        if (!allowedMimeTypes.includes(response.type)) {
            throw new Error(`Unsupported MIME type: ${response.type}`)
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(response)
            reader.onloadend = () => {
                resolve({
                    image: reader.result as string,
                    mime: response.type,
                    mediaType: MediaUtils.resolveMediaTypeFromMimeType(response.type),
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
