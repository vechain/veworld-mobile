import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { useMemo } from "react"
import { getStargateNetworkConfig } from "~Constants/Constants/Staking"
import {
    StargateDelegationFunctions,
    StargateDelegationRewards,
} from "~Constants/Constants/Staking/abis/StargateDelegation.abi"
import { StargateInfo } from "~Constants/Constants/Staking/abis/StargateNFT.abi"
import { useThorClient } from "~Hooks/useThorClient"
import { NftData, NodeInfo } from "~Model/Staking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getUserStargateNftsQueryKey = (stargateNodes: NodeInfo[]) => [
    "userStargateNfts",
    stargateNodes.map(node => node.nodeId).join(","),
]

export const getUserStargateNfts = async (
    thor: ThorClient,
    stargateNodes: NodeInfo[],
    stargateNFTAddress?: string,
    stargateDelegationAddress?: string,
): Promise<NftData[]> => {
    if (!stargateNodes?.length || !stargateNFTAddress || !stargateDelegationAddress) return []

    try {
        const nftsData: NftData[] = []

        for (const node of stargateNodes) {
            const tokenContract = thor.contracts.load(stargateNFTAddress, [StargateInfo.getToken])
            const tokenResult = await tokenContract.read.getToken(BigInt(node.nodeId))
            const tokenResultArray = tokenResult[0] as unknown as Array<any>

            const levelId = tokenResultArray[1]
            const vetAmountStaked = tokenResultArray[3]

            const delegationStatusContract = thor.contracts.load(stargateDelegationAddress, [
                StargateDelegationFunctions.isDelegationActive,
            ])
            const delegationStatusResult = await delegationStatusContract.read.isDelegationActive(BigInt(node.nodeId))
            const isDelegationActive = delegationStatusResult[0]

            const claimableRewardsContract = thor.contracts.load(stargateDelegationAddress, [
                StargateDelegationRewards.claimableRewards,
            ])
            const claimableRewardsResult = await claimableRewardsContract.read.claimableRewards(BigInt(node.nodeId))
            const claimableRewards = claimableRewardsResult[0]

            const accumulatedRewardsContract = thor.contracts.load(stargateDelegationAddress, [
                StargateDelegationRewards.accumulatedRewards,
            ])
            const accumulatedRewardsResult = await accumulatedRewardsContract.read.accumulatedRewards(
                BigInt(node.nodeId),
            )
            const accumulatedRewards = accumulatedRewardsResult[0]

            nftsData.push({
                tokenId: Number(node.nodeId),
                levelId: Number(levelId),
                vetAmountStaked: vetAmountStaked.toString(),
                isDelegated: isDelegationActive,
                claimableRewards: claimableRewards.toString(),
                accumulatedRewards: accumulatedRewards.toString(),
            })
        }

        return nftsData
    } catch (error) {
        throw new Error(`Error fetching stargate NFTs ${error}`)
    }
}

export const useUserStargateNfts = (stargateNodes: NodeInfo[] = [], isLoadingNodes?: boolean) => {
    const thor = useThorClient()
    const network = useAppSelector(selectSelectedNetwork)

    const { stargateNFTAddress, stargateDelegationAddress } = useMemo(() => {
        const config = getStargateNetworkConfig(network.type)
        return {
            stargateNFTAddress: config?.STARGATE_NFT_CONTRACT_ADDRESS,
            stargateDelegationAddress: config?.STARGATE_DELEGATION_CONTRACT_ADDRESS,
        }
    }, [network.type])

    const queryKey = useMemo(() => {
        return getUserStargateNftsQueryKey(stargateNodes)
    }, [stargateNodes])

    const enabled =
        !!thor && !!stargateNodes.length && !!stargateNFTAddress && !!stargateDelegationAddress && !isLoadingNodes

    const {
        data,
        isLoading: isLoadingStargate,
        error,
        isError,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: async () =>
            await getUserStargateNfts(thor, stargateNodes, stargateNFTAddress, stargateDelegationAddress),
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
