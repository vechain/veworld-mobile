import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { useMemo } from "react"
import {
    StargateDelegationEvents,
    StargateDelegationFunctions,
    StargateDelegationRewards,
} from "~Constants/Constants/Staking/abis/StargateDelegation.abi"
import { StargateInfo, StargateNftEvents } from "~Constants/Constants/Staking/abis/StargateNFT.abi"
import { useThorClient } from "~Hooks/useThorClient"
import { NETWORK_TYPE } from "~Model"
import { NftData, NodeInfo } from "~Model/Staking"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { getHistoricalVTHOClaimed } from "./historical"
import { useStargateConfig } from "~Hooks/useStargateConfig"

const getUserStargateNftsQueryKey = (network: NETWORK_TYPE, address: string | undefined, nodeIds: string[]) => [
    "userStargateNfts",
    network,
    address,
    nodeIds,
]

export const getUserStargateNfts = async (
    thor: ThorClient,
    stargateNodes: NodeInfo[],
    accountAddress: string,
    stargateNFTAddress?: string,
    stargateDelegationAddress?: string,
): Promise<NftData[]> => {
    if (!stargateNodes?.length || !stargateNFTAddress || !stargateDelegationAddress) return []
    const nftContract = thor.contracts.load(stargateNFTAddress, [
        StargateInfo.getToken,
        StargateInfo.claimableVetGeneratedVtho,
        StargateNftEvents.BaseVTHORewardsClaimed,
    ])
    const delegationContract = thor.contracts.load(stargateDelegationAddress, [
        StargateDelegationFunctions.isDelegationActive,
        StargateDelegationRewards.claimableRewards,
        StargateDelegationRewards.accumulatedRewards,
        StargateDelegationEvents.DelegationRewardsClaimed,
    ])

    try {
        const nftsData: NftData[] = []

        for (const node of stargateNodes) {
            const clauses = [
                nftContract.clause.getToken(BigInt(node.nodeId)),
                delegationContract.clause.isDelegationActive(BigInt(node.nodeId)),
                delegationContract.clause.claimableRewards(BigInt(node.nodeId)),
                nftContract.clause.claimableVetGeneratedVtho(BigInt(node.nodeId)),
            ]
            const result = await thor.transactions.executeMultipleClausesCall(clauses)

            if (result.some(r => !r.success)) throw new Error("[getUserStargateNfts]: Clause reverted")
            const accumulatedRewards = await getHistoricalVTHOClaimed(
                thor,
                node.nodeId,
                accountAddress,
                nftContract,
                delegationContract,
            )
            nftsData.push({
                tokenId: node.nodeId,
                //These two `any` are required since the SDK cannot infer the type
                levelId: (result[0].result.plain! as any).levelId.toString(),
                vetAmountStaked: (result[0].result.plain! as any).vetAmountStaked.toString(),
                isDelegated: result[1].result.plain as boolean,
                claimableRewards: BigNutils(result[2].result.plain as string).plus(result[3].result.plain as string)
                    .toString,
                accumulatedRewards: accumulatedRewards.toString,
            })
        }

        return nftsData
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

    const { stargateNFTAddress, stargateDelegationAddress } = useMemo(() => {
        return {
            stargateNFTAddress: stargateConfig?.STARGATE_NFT_CONTRACT_ADDRESS,
            stargateDelegationAddress: stargateConfig?.STARGATE_DELEGATION_CONTRACT_ADDRESS,
        }
    }, [stargateConfig?.STARGATE_DELEGATION_CONTRACT_ADDRESS, stargateConfig?.STARGATE_NFT_CONTRACT_ADDRESS])

    const queryKey = useMemo(() => {
        return getUserStargateNftsQueryKey(
            network.type,
            address,
            nodes.map(node => node.nodeId),
        )
    }, [address, network.type, nodes])

    const enabled = !!thor && !!nodes.length && !!stargateNFTAddress && !!stargateDelegationAddress && !isLoadingNodes

    const {
        data,
        isFetching: isLoadingStargate,
        error,
        isError,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: async () =>
            await getUserStargateNfts(thor, nodes, address, stargateNFTAddress, stargateDelegationAddress),
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
