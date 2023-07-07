import axios from "axios"
import { NFT_CONTRACTS_FOR_ADDRESS } from "~Constants"
import { PaginationResponse } from "./getNftsForContract"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { Network } from "~Model"

export type NFTContractAddresses = {
    data: string[]
    pagination: PaginationResponse
}

export const getContractAddresses = async (
    network: Network,
    ownerAddress: string,
    resultsPerPage: number,
    page: number,
) => {
    const response = await axios.get<NFTContractAddresses>(
        NFT_CONTRACTS_FOR_ADDRESS(
            network.type,
            ownerAddress,
            resultsPerPage,
            page,
        ),
        { timeout: NFT_AXIOS_TIMEOUT },
    )

    return response.data
}
