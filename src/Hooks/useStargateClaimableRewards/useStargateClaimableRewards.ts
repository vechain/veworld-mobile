import { useQuery } from "@tanstack/react-query"
import { fetchStargateVthoClaimed } from "~Networking"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

type Args = {
    nodeId: string
}

export const useStargateClaimableRewards = ({ nodeId }: Args) => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    return useQuery({
        queryKey: ["STARGATE_CLAIMABLE", network.genesis.id, account.address, nodeId],
        queryFn: () => fetchStargateVthoClaimed(network.type, account.address, nodeId),
        staleTime: 5 * 60 * 1000,
        gcTime: Infinity,
    })
}
