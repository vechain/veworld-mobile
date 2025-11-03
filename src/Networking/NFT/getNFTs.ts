import axios from "axios"
import { NFTS_OWNED_PER_OWNER } from "~Constants"
import { NftForContractResponse } from "./getNftsForContract"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { NETWORK_TYPE } from "~Model"

export const getNFTs = async (
    networkType: NETWORK_TYPE,
    ownerAddress: string,
    resultsPerPage: number,
    page: number,
) => {
    const response = await axios.get<NftForContractResponse>(
        NFTS_OWNED_PER_OWNER(networkType, ownerAddress, resultsPerPage, page),
        { timeout: NFT_AXIOS_TIMEOUT },
    )

    return response.data
}
