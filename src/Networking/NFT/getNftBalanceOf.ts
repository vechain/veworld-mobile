import { ThorClient } from "@vechain/sdk-network"
import { VIP180_ABI } from "@vechain/sdk-core"
import { queryClient } from "~Api/QueryProvider"
import { queryOptions } from "@tanstack/react-query"

const getNftBalanceOf = async (ownerAddress: string, contractAddress: string, thor: ThorClient) => {
    const res = await thor.contracts.load(contractAddress, VIP180_ABI).read.balanceOf(ownerAddress)
    return Number(res[0]) || 0
}

const getNftBalanceOfOptions = (ownerAddress: string, contractAddress: string, thor: ThorClient) => {
    return queryOptions({
        queryKey: ["COLLECTIBLES", "BALANCE_OF", ownerAddress, contractAddress],
        queryFn: () => getNftBalanceOf(ownerAddress, contractAddress, thor),
        staleTime: 1 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })
}

export const getCachedNftBalanceOf = async (ownerAddress: string, contractAddress: string, thor: ThorClient) => {
    const res = await queryClient.fetchQuery(getNftBalanceOfOptions(ownerAddress, contractAddress, thor))
    return res || 0
}
