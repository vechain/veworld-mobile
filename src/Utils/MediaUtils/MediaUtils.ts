import { NFTMediaType } from "~Model"

const isValidMimeType = (mime: string, type: NFTMediaType[]) => {
    const found = type.find(t => {
        if (mime?.split("/")[0] === t) {
            return true
        }
    })

    return !!found
}

export default { isValidMimeType }
