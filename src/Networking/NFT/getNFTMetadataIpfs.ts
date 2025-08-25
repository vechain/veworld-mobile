import { queryClient } from "~Api/QueryProvider"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { NFTMetadata } from "~Model/Nft/Nft"
import IPFSUtils from "~Utils/IPFSUtils"

// TODO (Piero) (https://github.com/vechainfoundation/veworld-mobile/issues/803) Remove centralization to only 1 Public gateway.

export const getNFTMetadataIpfs = (uri: string) =>
    queryClient.fetchQuery(
        IPFSUtils.getIpfsQueryKeyOptions<NFTMetadata>(uri, { responseType: "blob", timeout: NFT_AXIOS_TIMEOUT }),
    )
