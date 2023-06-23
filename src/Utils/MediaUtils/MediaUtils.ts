import { NFTMediaType } from "~Model"

const getMime = (mime: string, type: NFTMediaType[]) => {
    return type.find(t => {
        if (mime.split("/")[0] === t) {
            return true
        }
    })
}

export default { getMime }
