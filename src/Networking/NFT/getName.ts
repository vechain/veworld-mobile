import { VIP181_ABI } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"

export const getName = async (contractAddress: string, thor: ThorClient): Promise<string> => {
    const name = await thor.contracts.load(contractAddress, VIP181_ABI).read.name()
    return name[0] as string
}
