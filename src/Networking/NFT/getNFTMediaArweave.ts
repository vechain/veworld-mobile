import Arweave from "arweave"
import { MAX_IMAGE_SIZE, NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { MediaUtils, debug } from "~Utils"
import { NFTMedia } from "~Model"
import { ERROR_EVENTS } from "~Constants"

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
        let processedId

        // Some uris have the arweave.net/ prefix, some don't, so we need to remove it if it's there
        // otherwise the request will fail
        if (txId.includes("arweave.net/")) {
            processedId = txId.split("arweave.net/")[1]
        } else {
            processedId = txId
        }

        const tx = await arweave.transactions.get(processedId)

        const buffer = Buffer.from(tx.data)

        if (buffer.length > MAX_IMAGE_SIZE) {
            throw new Error(`Image size exceeds the maximum allowed size of ${MAX_IMAGE_SIZE} bytes.`)
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
        debug(ERROR_EVENTS.NFT, err)
        throw err
    }
}
