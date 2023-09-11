import Arweave from "arweave"
import { error } from "~Utils/Logger"
import { MAX_IMAGE_SIZE, NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { MediaUtils } from "~Utils"
import { NFTMedia } from "~Model"

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: NFT_AXIOS_TIMEOUT, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
})

const toID = (uri: string) => uri?.split("://")[1]

export const getNFTMediaArweave = async (uri: string): Promise<NFTMedia> => {
    try {
        const txId = toID(uri)
        const transaction = await arweave.transactions.get(txId)
        const buffer = Buffer.from(transaction.data)

        if (buffer.length > MAX_IMAGE_SIZE) {
            throw new Error(
                `Image size exceeds the maximum allowed size of ${MAX_IMAGE_SIZE} bytes.`,
            )
        }

        const mimeType = MediaUtils.resolveMimeTypeFromRawData(buffer)
        if (!mimeType) {
            throw new Error("Couldn't identify the MIME type of the image.")
        }

        const dataURI = `data:${mimeType};base64,${buffer.toString("base64")}`
        return {
            image: dataURI,
            mime: mimeType,
            mediaType: MediaUtils.resolveMediaTypeFromMimeType(mimeType),
        }
    } catch (err) {
        error("Error fetching the image:", err)
        throw err
    }
}
