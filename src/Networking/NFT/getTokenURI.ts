import { VIP181_ABI } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"

export const getTokenURI = async (tokenId: string, contractAddress: string, thor: ThorClient) => {
    const res = await thor.contracts.load(contractAddress, VIP181_ABI).read.tokenURI(tokenId)
    return res[0] as string
}
