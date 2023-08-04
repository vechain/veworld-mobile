import axios from "axios"
import { TokenMetadata } from "~Model/Nft/Nft"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import URIUtils from "~Utils/URIUtils"
import { debug } from "~Utils"

// TODO (Piero) (https://github.com/vechainfoundation/veworld-mobile/issues/803) Remove centralization to only 1 Public gateway.

export const getTokenMetaIpfs = async (uri: string): Promise<TokenMetadata> => {
    debug(`Getting IPFS metadata for ${uri}`)
    const metadata = await axios.get<TokenMetadata>(
        URIUtils.convertUriToUrl(uri),
        {
            timeout: NFT_AXIOS_TIMEOUT,
        },
    )
    debug(`Got IPFS metadata for ${uri} ${JSON.stringify(metadata.data)}`)

    return metadata.data
}
