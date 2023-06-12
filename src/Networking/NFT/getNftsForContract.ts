import axios from "axios"
import { NFTS_OWNED_PER_CONTRACT } from "~Constants"

export type NftItemResponse = {
    id: string
    tokenId: string
    contractAddress: string
    owner: string
    txId: string
    blockNumber: number
    blockId: string
}

export type PaginationResponse = {
    countLimit: number
    hasNext: boolean
    isExactCount: boolean
    totalElements: number
    totalPages: number
}

export type NftForContractResponse = {
    data: NftItemResponse[]
    pagination: PaginationResponse
}

export const getNftsForContract = async (
    contractAddress: string,
    ownerAddress: string,
    resultsPerPage: number = 20,
    page: number = 0,
): Promise<NftForContractResponse[]> => {
    const response = await axios.get(
        NFTS_OWNED_PER_CONTRACT(
            ownerAddress,
            contractAddress,
            resultsPerPage,
            page,
        ),
    )

    return response.data || {}
}
