import Arweave from "arweave"
import { error } from "~Utils/Logger"
import { MAX_IMAGE_SIZE, NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: NFT_AXIOS_TIMEOUT, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
})

const toID = (uri: string) => uri?.split("://")[1]

const identifyMimeType = (buffer: Buffer): string | null => {
    // Check the buffer length to prevent out-of-bounds errors
    if (buffer.length < 4) {
        return null
    }

    // Retrieve the first 4 bytes of the file
    const magicBytes = buffer.subarray(0, 4)

    // Define magic numbers for JPEG, PNG, and GIF
    const jpgMagic = Buffer.from([0xff, 0xd8, 0xff])
    const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47])
    const gifMagic = Buffer.from([0x47, 0x49, 0x46, 0x38])

    // Identify the file type based on magic numbers
    if (Buffer.from(magicBytes.subarray(0, 3)).equals(jpgMagic)) {
        return "image/jpeg"
    }
    if (Buffer.from(magicBytes.subarray(0, 4)).equals(pngMagic)) {
        return "image/png"
    }
    if (Buffer.from(magicBytes.subarray(0, 4)).equals(gifMagic)) {
        return "image/gif"
    }

    return null
}

export const getTokenImageArweave = async (uri: string): Promise<string> => {
    try {
        const txId = toID(uri)
        const transaction = await arweave.transactions.get(txId)
        const buffer = Buffer.from(transaction.data)

        if (buffer.length > MAX_IMAGE_SIZE) {
            throw new Error(
                `Image size exceeds the maximum allowed size of ${MAX_IMAGE_SIZE} bytes.`,
            )
        }

        const mimeType = identifyMimeType(buffer)
        if (!mimeType) {
            throw new Error("Couldn't identify the MIME type of the image.")
        }

        const dataURI = `data:${mimeType};base64,${buffer.toString("base64")}`
        return dataURI
    } catch (err) {
        error("Error fetching the image:", err)
        throw err
    }
}
