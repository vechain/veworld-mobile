import axios from "axios"
import { error } from "~Common/Logger"
import { TokenMetadata } from "~Model/Nft/Nft"

const toID = (_tokenUri: string) => _tokenUri.split("://")[1]

// loop

export const getTokenMetaIpfs = async (
    tokenUri: string,
): Promise<TokenMetadata> => {
    try {
        const id = toID(tokenUri)
        const metadata = await axios.get<TokenMetadata>(
            `https://ipfs.io/ipfs/${id}`,
        )

        return metadata.data
    } catch (e) {
        error(e)
        throw e
    }
}

export const getImageUrlIpfs = (uri: string): string => {
    const id = toID(uri)
    return `https://ipfs.io/ipfs/${id}`
}
