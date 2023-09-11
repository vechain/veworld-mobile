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

    return metadata.data
}
