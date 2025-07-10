import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { useThorClient } from "~Hooks/useThorClient"
import { useBlockchainNetwork } from "~Hooks/useBlockchainNetwork"
import { NETWORK_TYPE } from "~Model/Network/enums"
import { useMemo } from "react"
import { getStartgatNetworkConfig } from "~Constants/Constants/Staking"
import { StargateInfo } from "~Constants/Constants/Staking/abis/StargateNFT.abi"
import {
    StargateDelegationFunctions,
    StargateDelegationRewards,
} from "~Constants/Constants/Staking/abis/StargateDelegation.abi"
import { NodeInfo, NftData } from "~Model/Staking"

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

export const useUserStargateNfts = (
    stargateNodes: NodeInfo[] = [],
    isLoadingNodes?: boolean,
    refetchInterval?: number,
) => {
    const thor = useThorClient()
    const { network } = useBlockchainNetwork()

    const networkType = useMemo(() => {
        return network.type === NETWORK_TYPE.MAIN ? "mainnet" : "testnet"
    }, [network.type])

    const { stargateNFTAddress, stargateDelegationAddress } = useMemo(() => {
        const config = getStartgatNetworkConfig(networkType)
        return {
            stargateNFTAddress: config?.STARGATE_NFT_CONTRACT_ADDRESS,
            stargateDelegationAddress: config?.STARGATE_DELEGATION_CONTRACT_ADDRESS,
        }
    }, [networkType])

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
        refetchInterval,
        staleTime: 60000,
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
