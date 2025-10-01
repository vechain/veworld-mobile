import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { StargateInfo, stargateNetworkConfig } from "~Constants"
import { useMainnetThorClient } from "~Hooks/useThorClient"

export const getLevelCirculatingSuppliesQueryKey = () => ["LEVEL_CIRCULATING_SUPPLIES"]

export const getLevelCirculatingSupplies = async (thor: ThorClient) => {
    return await thor.contracts
        .load(stargateNetworkConfig.mainnet.STARGATE_NFT_CONTRACT_ADDRESS, [StargateInfo.getLevelsCirculatingSupplies])
        .read.getLevelsCirculatingSupplies()
}

export const useLevelCirculatingSupplies = () => {
    const thor = useMainnetThorClient()

    return useQuery({
        queryKey: getLevelCirculatingSuppliesQueryKey(),
        queryFn: async () => await getLevelCirculatingSupplies(thor),
        staleTime: 60 * 5 * 1000,
        gcTime: 60 * 5 * 1000,
        enabled: !!thor,
        select: data => {
            return data ? data.flat().map((supply: bigint) => Number(supply)) : []
        },
    })
}
