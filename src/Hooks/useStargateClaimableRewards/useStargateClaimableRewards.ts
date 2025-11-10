import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { Stargate } from "~Constants"
import { StargateConfiguration, useStargateConfig } from "~Hooks/useStargateConfig"
import { useThorClient } from "~Hooks/useThorClient"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import ThorUtils from "~Utils/ThorUtils"

type Args = {
    nodeId: string
}

const getStargateClaimableRewards = async (thor: ThorClient, config: StargateConfiguration, tokenId: string) => {
    const result = await ThorUtils.clause.executeMultipleClausesCall(
        thor,
        ThorUtils.clause.getContractClauseOfMethod(
            config.STARGATE_CONTRACT_ADDRESS ?? config.STARGATE_DELEGATION_CONTRACT_ADDRESS!,
            [Stargate.claimableRewards],
            "claimableRewards",
            [BigInt(tokenId)],
        ),
    )
    ThorUtils.clause.assertMultipleClausesCallSuccess(result, () => {
        throw new Error("[getStargateClaimableRewards]: Clause reverted")
    })

    return result[0].result.plain.toString()
}

export const useStargateClaimableRewards = ({ nodeId }: Args) => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const thor = useThorClient()
    const config = useStargateConfig(network)
    return useQuery({
        queryKey: ["STARGATE_CLAIMABLE", network.genesis.id, account.address, nodeId],
        queryFn: () => getStargateClaimableRewards(thor, config, nodeId),
        staleTime: 5 * 60 * 1000,
        gcTime: Infinity,
        retry: 3,
    })
}
