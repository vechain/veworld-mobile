import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { getStargateNetworkConfig, StargateInfo } from "~Constants"
import { useThorClient } from "~Hooks/useThorClient"
import { NETWORK_TYPE } from "~Model/Network"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectSelectedNetwork } from "~Storage/Redux/Selectors"

export const getLevelCirculatingSuppliesQueryKey = () => ["LEVEL_CIRCULATING_SUPPLIES"]

export const getLevelCirculatingSupplies = async (thor: ThorClient, networkType: NETWORK_TYPE) => {
    const config = getStargateNetworkConfig(networkType)
    return await thor.contracts
        .load(config?.STARGATE_NFT_CONTRACT_ADDRESS, [StargateInfo.getLevelsCirculatingSupplies])
        .read.getLevelsCirculatingSupplies()
}

export const useLevelCirculatingSupplies = () => {
    const thor = useThorClient()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    return useQuery({
        queryKey: getLevelCirculatingSuppliesQueryKey(),
        queryFn: async () => await getLevelCirculatingSupplies(thor, selectedNetwork.type),
        staleTime: 60 * 5 * 1000,
        gcTime: 60 * 5 * 1000,
        enabled: !!thor && !!selectedNetwork.type,
        select: data => {
            return data ? data.flat().map((supply: bigint) => Number(supply)) : []
        },
    })
}
