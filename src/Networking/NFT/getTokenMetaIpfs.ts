import axios from "axios"
import { TokenMetadata } from "~Model/Nft/Nft"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { validateIpfsUri } from "~Utils/IPFSUtils/IPFSUtils"

const toID = (_tokenUri: string) => _tokenUri?.split("://")[1]

// TODO (Piero) (https://github.com/vechainfoundation/veworld-mobile/issues/803) Remove centralization to only 1 Public gateway.

export const getTokenMetaIpfs = async (uri: string): Promise<TokenMetadata> => {
    if (!validateIpfsUri(uri)) throw new Error(`Invalid IPFS URI ${uri}`)
    const id = toID(uri)
    const metadata = await axios.get<TokenMetadata>(
        `https://ipfs.io/ipfs/${id}`,
        { timeout: NFT_AXIOS_TIMEOUT },
    )

    return metadata.data
}

export const getImageUrlIpfs = (uri: string): string => {
    if (!validateIpfsUri(uri)) throw new Error(`Invalid IPFS URI ${uri}`)
    const id = toID(uri)
    return `https://ipfs.io/ipfs/${id}`
}
