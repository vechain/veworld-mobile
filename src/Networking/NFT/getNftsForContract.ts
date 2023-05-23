import axios from "axios"
import { NFTS_OWNED_PER_CONTRACT } from "~Common"

export type NftForContractResponse = {
    id?: "string"
    tokenId: 0
    contractAddress: "string"
    owner: "string"
    txId: "string"
    blockNumber: 0
    blockId: "string"
}

export const getNftsForContract = async (
    contractAddress: string,
    ownerAddress: string,
): Promise<NftForContractResponse[]> => {
    const response = await axios.get(
        NFTS_OWNED_PER_CONTRACT(ownerAddress, contractAddress),
    )
    return response.data || []
}
