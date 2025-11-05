import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { StargateInfo } from "~Constants"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { useMainnetThorClient } from "~Hooks/useThorClient"
import { selectDefaultMainnet, useAppSelector } from "~Storage/Redux"

export const getLevelCirculatingSuppliesQueryKey = () => ["LEVEL_CIRCULATING_SUPPLIES"]

export const getLevelCirculatingSupplies = async (thor: ThorClient, address: string) => {
    return await thor.contracts
        .load(address, [StargateInfo.getLevelsCirculatingSupplies])
        .read.getLevelsCirculatingSupplies()
}

export const useLevelCirculatingSupplies = () => {
    const thor = useMainnetThorClient()
    const mainnet = useAppSelector(selectDefaultMainnet)
    const stargateConfig = useStargateConfig(mainnet)

    return useQuery({
        queryKey: getLevelCirculatingSuppliesQueryKey(),
        queryFn: async () => await getLevelCirculatingSupplies(thor, stargateConfig.STARGATE_NFT_CONTRACT_ADDRESS!),
        staleTime: 60 * 5 * 1000,
        gcTime: 60 * 30 * 1000,
        enabled: !!thor,
        select: data => {
            return data ? data.flat().map((supply: bigint) => Number(supply)) : []
        },
    })
}
