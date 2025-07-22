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
import { NETWORK_TYPE } from "~Model"
import { NftData, NodeInfo } from "~Model/Staking"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getUserStargateNftsQueryKey = (
    network: NETWORK_TYPE,
    address: string | undefined,
    nodesLength: number,
) => ["userStargateNfts", network, address, nodesLength]

export const getUserStargateNfts = async (
    thor: ThorClient,
    stargateNodes: NodeInfo[],
    stargateNFTAddress?: string,
    stargateDelegationAddress?: string,
): Promise<NftData[]> => {
    if (!stargateNodes?.length || !stargateNFTAddress || !stargateDelegationAddress) return []
    const nftContract = thor.contracts.load(stargateNFTAddress, [StargateInfo.getToken])
    const delegationContract = thor.contracts.load(stargateDelegationAddress, [
        StargateDelegationFunctions.isDelegationActive,
        StargateDelegationRewards.claimableRewards,
        StargateDelegationRewards.accumulatedRewards,
    ])

    try {
        const nftsData: NftData[] = []

        for (const node of stargateNodes) {
            const clauses = [
                nftContract.clause.getToken(BigInt(node.nodeId)),
                delegationContract.clause.isDelegationActive(BigInt(node.nodeId)),
                delegationContract.clause.claimableRewards(BigInt(node.nodeId)),
                delegationContract.clause.accumulatedRewards(BigInt(node.nodeId)),
            ]
            const result = await thor.transactions.executeMultipleClausesCall(clauses)

            if (result.some(r => !r.success)) throw new Error("[getUserStargateNfts]: Clause reverted")
            nftsData.push({
                tokenId: node.nodeId,
                //These two `any` are required since the SDK cannot infer the type
                levelId: (result[0].result.plain! as any).levelId.toString(),
                vetAmountStaked: (result[0].result.plain! as any).vetAmountStaked.toString(),
                isDelegated: result[1].result.plain as boolean,
                claimableRewards: result[2].result.plain as string,
                accumulatedRewards: result[3].result.plain as string,
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
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { stargateNFTAddress, stargateDelegationAddress } = useMemo(() => {
        const config = getStargateNetworkConfig(network.type)
        return {
            stargateNFTAddress: config?.STARGATE_NFT_CONTRACT_ADDRESS,
            stargateDelegationAddress: config?.STARGATE_DELEGATION_CONTRACT_ADDRESS,
        }
    }, [network.type])

    const queryKey = useMemo(() => {
        return getUserStargateNftsQueryKey(network.type, selectedAccount.address, stargateNodes.length)
    }, [network.type, selectedAccount.address, stargateNodes.length])

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
