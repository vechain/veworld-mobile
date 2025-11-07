import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { useMemo } from "react"
import { Stargate } from "~Constants"
import {
    StargateDelegationEvents,
    StargateDelegationRewards,
} from "~Constants/Constants/Staking/abis/StargateDelegation.abi"
import { StargateInfo, StargateNftEvents } from "~Constants/Constants/Staking/abis/StargateNFT.abi"
import { StargateConfiguration, useStargateConfig } from "~Hooks/useStargateConfig"
import { useThorClient } from "~Hooks/useThorClient"
import { NETWORK_TYPE } from "~Model"
import { NftData, NodeInfo } from "~Model/Staking"
import { fetchStargateVthoClaimed } from "~Networking"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import ThorUtils from "~Utils/ThorUtils"
import { getHistoricalVTHOClaimed } from "./historical"
import { ABIContract } from "@vechain/sdk-core"

const getUserStargateNftsQueryKey = (network: NETWORK_TYPE, address: string | undefined, nodeIds: string[]) => [
    "userStargateNfts",
    network,
    address,
    nodeIds,
]

/**
 * Get the stargate NFTs pre-Hayabusa
 * @param thor Thor Client
 * @param stargateNodes Stargate nodes
 * @param accountAddress Account address
 * @param config Stargate addresses config
 */
const getLegacyUserStargateNfts = async (
    thor: ThorClient,
    stargateNodes: NodeInfo[],
    accountAddress: string,
    config: StargateConfiguration,
): Promise<NftData[]> => {
    const nftsData: NftData[] = []

    const getTokenMethod = ThorUtils.clause.getMethod(
        [StargateInfo.getToken],
        config.STARGATE_NFT_CONTRACT_ADDRESS!,
        "getToken",
    )

    const claimableRewardsMethod = ThorUtils.clause.getMethod(
        [StargateDelegationRewards.claimableRewards],
        config.STARGATE_DELEGATION_CONTRACT_ADDRESS!,
        "claimableRewards",
    )
    const claimableVetGeneratedVthoMethod = ThorUtils.clause.getMethod(
        [StargateInfo.claimableVetGeneratedVtho],
        config.STARGATE_NFT_CONTRACT_ADDRESS!,
        "claimableVetGeneratedVtho",
    )

    const BaseVTHORewardsClaimedEvent = ABIContract.ofAbi([StargateNftEvents.BaseVTHORewardsClaimed]).getEvent(
        "BaseVTHORewardsClaimed",
    )
    const DelegationRewardsClaimedEvent = ABIContract.ofAbi([
        StargateDelegationEvents.DelegationRewardsClaimed,
    ]).getEvent("DelegationRewardsClaimed")

    for (const node of stargateNodes) {
        const result = await ThorUtils.clause.executeMultipleClausesCall(
            thor,
            getTokenMethod.asContractClause([BigInt(node.nodeId)]),
            claimableRewardsMethod.asContractClause([BigInt(node.nodeId)]),
            claimableVetGeneratedVthoMethod.asContractClause([BigInt(node.nodeId)]),
        )
        ThorUtils.clause.assertMultipleClausesCallSuccess(result, () => {
            throw new Error("[getUserStargateNfts]: Clause reverted")
        })
        const accumulatedRewards = await getHistoricalVTHOClaimed(thor, node.nodeId, accountAddress, config, {
            BaseVTHORewardsClaimed: BaseVTHORewardsClaimedEvent,
            DelegationRewardsClaimed: DelegationRewardsClaimedEvent,
        })
        nftsData.push({
            tokenId: node.nodeId,
            levelId: result[0].result.plain.levelId.toString(),
            vetAmountStaked: result[0].result.plain.vetAmountStaked.toString(),
            claimableRewards: BigNutils(result[1].result.plain).plus(result[2].result.plain).toString,
            accumulatedRewards: accumulatedRewards.toString,
        })
    }

    return nftsData
}

const getHayabusaNfts = async (
    thor: ThorClient,
    networkType: NETWORK_TYPE,
    stargateNodes: NodeInfo[],
    accountAddress: string,
    config: StargateConfiguration,
): Promise<NftData[]> => {
    const nftsData: NftData[] = []

    const getTokenMethod = ThorUtils.clause.getMethod(
        [StargateInfo.getToken],
        config.STARGATE_NFT_CONTRACT_ADDRESS!,
        "getToken",
    )

    const claimableRewardsMethod = ThorUtils.clause.getMethod(
        [Stargate.claimableRewards],
        config.STARGATE_CONTRACT_ADDRESS!,
        "claimableRewards",
    )

    for (const node of stargateNodes) {
        const result = await ThorUtils.clause.executeMultipleClausesCall(
            thor,
            getTokenMethod.asContractClause([BigInt(node.nodeId)]),
            claimableRewardsMethod.asContractClause([BigInt(node.nodeId)]),
        )
        ThorUtils.clause.assertMultipleClausesCallSuccess(result, () => {
            throw new Error("[getHayabusaNfts]: Clause reverted")
        })
        const accumulatedRewards = await fetchStargateVthoClaimed(networkType, accountAddress, node.nodeId)
        nftsData.push({
            tokenId: node.nodeId,
            levelId: result[0].result.plain.levelId.toString(),
            vetAmountStaked: result[0].result.plain.vetAmountStaked.toString(),
            claimableRewards: result[1].result.plain.toString(),
            accumulatedRewards: accumulatedRewards.toString(),
        })
    }

    return nftsData
}

export const getUserStargateNfts = async (
    thor: ThorClient,
    networkType: NETWORK_TYPE,
    stargateNodes: NodeInfo[],
    accountAddress: string,
    config: StargateConfiguration,
): Promise<NftData[]> => {
    if (!stargateNodes?.length || !config.STARGATE_NFT_CONTRACT_ADDRESS || !config.STARGATE_DELEGATION_CONTRACT_ADDRESS)
        return []

    try {
        if (!config.STARGATE_CONTRACT_ADDRESS)
            return await getLegacyUserStargateNfts(thor, stargateNodes, accountAddress, config)
        return getHayabusaNfts(thor, networkType, stargateNodes, accountAddress, config)
    } catch (error) {
        throw new Error(`Error fetching stargate NFTs ${error}`)
    }
}

export const useUserStargateNfts = ({
    nodes = [],
    isLoadingNodes,
    address: _address,
}: {
    nodes: NodeInfo[]
    isLoadingNodes?: boolean
    address?: string
}) => {
    const thor = useThorClient()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const address = useMemo(() => _address ?? selectedAccount.address, [_address, selectedAccount.address])

    const stargateConfig = useStargateConfig(network)

    const queryKey = useMemo(() => {
        return getUserStargateNftsQueryKey(
            network.type,
            address,
            nodes.map(node => node.nodeId),
        )
    }, [address, network.type, nodes])

    const enabled = !!thor && !!nodes.length && Object.keys(stargateConfig).length > 0 && !isLoadingNodes

    const {
        data,
        isFetching: isLoadingStargate,
        error,
        isError,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: async () => await getUserStargateNfts(thor, network.type, nodes, address, stargateConfig),
        enabled,
        staleTime: 60 * 5 * 1000,
    })

    const hasCallErrors = useMemo(() => {
        return isError || false
    }, [isError])

    return {
        ownedStargateNfts: data || [],
        isLoading: isLoadingNodes || isLoadingStargate,
        refetch,
        error,
        isError,
        hasCallErrors,
    }
}
