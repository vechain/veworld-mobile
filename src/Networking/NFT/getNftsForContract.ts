import axios from "axios"
import { NFTS_OWNED_PER_CONTRACT } from "~Constants"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { NETWORK_TYPE } from "~Model"

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
    hasCount: boolean
    totalElements: number
    totalPages: number
}

export type NftForContractResponse = {
    data: NftItemResponse[]
    pagination: PaginationResponse
}

export const getNftsForContract = async (
    networkType: NETWORK_TYPE,
    contractAddress: string,
    ownerAddress: string,
    resultsPerPage: number = 20,
    page: number = 0,
): Promise<NftForContractResponse[]> => {
    const response = await axios.get(
        NFTS_OWNED_PER_CONTRACT(
            networkType,
            ownerAddress,
            contractAddress,
            resultsPerPage,
            page,
        ),
        { timeout: NFT_AXIOS_TIMEOUT },
    )

    return response.data || {}
}
