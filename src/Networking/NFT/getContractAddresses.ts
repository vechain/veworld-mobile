import axios from "axios"
import { NFT_CONTRACTS_FOR_ADDRESS } from "./VechainIndexer"

export type NFTContractAddresses = {
    data: string[]
    pagination: { totalElements: number; totalPages: number }
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
