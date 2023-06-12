import axios from "axios"
import { NFT_CONTRACTS_FOR_ADDRESS } from "./VechainIndexer"
import { PaginationResponse } from "./getNftsForContract"

export type NFTContractAddresses = {
    data: string[]
    pagination: PaginationResponse
}

export const getContractAddresses = async (
    ownerAddress: string,
    resultsPerPage: number,
    page: number,
) => {
    const response = await axios.get<NFTContractAddresses>(
        NFT_CONTRACTS_FOR_ADDRESS(ownerAddress, resultsPerPage, page),
    )

    return response.data
}
