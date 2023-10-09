import axios from "axios"
import { NFTMetadata } from "~Model/Nft/Nft"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import URIUtils from "~Utils/URIUtils"

// TODO (Piero) (https://github.com/vechainfoundation/veworld-mobile/issues/803) Remove centralization to only 1 Public gateway.

export const getNFTMetadataIpfs = async (uri: string): Promise<NFTMetadata> => {
    const metadata = await axios.get<NFTMetadata>(
        URIUtils.convertUriToUrl(uri),
        {
            timeout: NFT_AXIOS_TIMEOUT,
        },
    )

    return convertFirstLetterToLowerCase(metadata.data)
}

function convertFirstLetterToLowerCase<T>(obj: T): T {
    const newObj: Partial<T> = {}

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = key.charAt(0).toLowerCase() + key.slice(1)
            newObj[newKey as keyof T] = obj[key]
        }
    }

    return newObj as T
}
