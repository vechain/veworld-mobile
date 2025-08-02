import { ThorClient } from "@vechain/sdk-network"
import { VIP180_ABI } from "@vechain/sdk-core"

export const getNftBalanceOf = async (ownerAddress: string, contractAddress: string, thor: ThorClient) => {
    const res = await thor.contracts.load(contractAddress, VIP180_ABI).read.balanceOf(ownerAddress)
    return Number(res[0]) || 0
}
