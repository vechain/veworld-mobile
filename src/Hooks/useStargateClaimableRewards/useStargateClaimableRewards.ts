import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { useMemo } from "react"
import { Stargate, StargateInfo } from "~Constants"
import { StargateConfiguration, useStargateConfig } from "~Hooks/useStargateConfig"
import { useThorClient } from "~Hooks/useThorClient"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import ThorUtils from "~Utils/ThorUtils"

type Args = {
    nodeId: string
}

const getStargateClaimableRewardsLegacy = async (thor: ThorClient, config: StargateConfiguration, tokenId: string) => {
    const result = await ThorUtils.clause.executeMultipleClausesCall(
        thor,
        ThorUtils.clause.getContractClauseOfMethod(
            config.STARGATE_DELEGATION_CONTRACT_ADDRESS!,
            [Stargate.claimableRewards],
            "claimableRewards",
            [BigInt(tokenId)],
        ),
        ThorUtils.clause.getContractClauseOfMethod(
            config.STARGATE_NFT_CONTRACT_ADDRESS!,
            [StargateInfo.claimableVetGeneratedVtho],
            "claimableVetGeneratedVtho",
            [BigInt(tokenId)],
        ),
    )
    ThorUtils.clause.assertMultipleClausesCallSuccess(result, () => {
        throw new Error("[getStargateClaimableRewards]: Clause reverted")
    })

    return BigNutils(result[0].result.plain).plus(result[1].result.plain).toString
}

const getStargateClaimableRewardsHayabusa = async (
    thor: ThorClient,
    config: StargateConfiguration,
    tokenId: string,
) => {
    const result = await ThorUtils.clause.executeMultipleClausesCall(
        thor,
        ThorUtils.clause.getContractClauseOfMethod(
            config.STARGATE_CONTRACT_ADDRESS!,
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

const getStargateClaimableRewards = (thor: ThorClient, config: StargateConfiguration, tokenId: string) => {
    if (config.STARGATE_CONTRACT_ADDRESS) return getStargateClaimableRewardsHayabusa(thor, config, tokenId)
    return getStargateClaimableRewardsLegacy(thor, config, tokenId)
}

export const useStargateClaimableRewards = ({ nodeId }: Args) => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const thor = useThorClient()
    const config = useStargateConfig(network)

    const enabled = useMemo(() => Object.keys(config).length > 0, [config])

    return useQuery({
        queryKey: ["STARGATE_CLAIMABLE", network.genesis.id, account.address, nodeId],
        queryFn: () => getStargateClaimableRewards(thor, config, nodeId),
        staleTime: 5 * 60 * 1000,
        retry: 3,
        enabled,
    })
}
