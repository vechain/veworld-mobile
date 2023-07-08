import axios from "axios"
import { NFT_CONTRACTS_FOR_ADDRESS } from "~Constants"
import { PaginationResponse } from "./getNftsForContract"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { NETWORK_TYPE } from "~Model"

export type NFTContractAddresses = {
    data: string[]
    pagination: PaginationResponse
}

export const getContractAddresses = async (
    networkType: NETWORK_TYPE,
    ownerAddress: string,
    resultsPerPage: number,
    page: number,
) => {
    const response = await axios.get<NFTContractAddresses>(
        NFT_CONTRACTS_FOR_ADDRESS(
            networkType,
            ownerAddress,
            resultsPerPage,
            page,
        ),
        { timeout: NFT_AXIOS_TIMEOUT },
    )

    return response.data
}
