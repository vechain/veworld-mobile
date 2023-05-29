import axios from "axios"
import { NFT_CONTRACTS_FOR_ADDRESS } from "~Common"

export const getContractAddresses = async (ownerAddress: string) => {
    const response = await axios.get<string[]>(
        NFT_CONTRACTS_FOR_ADDRESS(ownerAddress),
    )
    return response.data
}
