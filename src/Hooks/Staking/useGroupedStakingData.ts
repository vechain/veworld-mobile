import { useMemo } from "react"
import { useUserNodes } from "./useUserNodes"
import { useUserStargateNfts } from "./useUserStargateNfts"
import { NftData, NodeInfo } from "~Model/Staking"
import { AddressUtils } from "~Utils"

export interface StakingGroup {
    /** Owner/Manager address */
    address: string
    /** Nodes for this address */
    nodes: NodeInfo[]
    /** NFT data for these nodes */
    nfts: NftData[]
    /** Whether user is owner (vs just manager) */
    isOwner: boolean
    /** Loading state */
    isLoading: boolean
}

export const useGroupedStakingData = (userAddress?: string) => {
    const { stargateNodes, isLoading: isLoadingNodes } = useUserNodes(userAddress)
    const { ownedStargateNfts, isLoading: isLoadingNfts } = useUserStargateNfts(stargateNodes, isLoadingNodes)

    const stakingGroups = useMemo((): StakingGroup[] => {
        if (!stargateNodes.length) return []

        // Group nodes by owner address
        const nodesByOwner = stargateNodes.reduce((acc, node) => {
            const ownerAddress = node.xNodeOwner
            if (!acc[ownerAddress]) {
                acc[ownerAddress] = []
            }
            acc[ownerAddress].push(node)
            return acc
        }, {} as Record<string, NodeInfo[]>)

        // Create staking groups and sort by ownership (owned nodes first)
        return Object.entries(nodesByOwner)
            .map(([ownerAddress, nodes]) => {
                // Filter NFTs for this owner's nodes
                const nodeIds = new Set(nodes.map(n => n.nodeId))
                const nftsForOwner = ownedStargateNfts.filter(nft => nodeIds.has(nft.tokenId))

                return {
                    address: ownerAddress,
                    nodes,
                    nfts: nftsForOwner,
                    isOwner: AddressUtils.compareAddresses(ownerAddress, userAddress),
                    isLoading: isLoadingNodes || isLoadingNfts,
                }
            })
            .sort((a, b) => {
                // Owned nodes first, then managed nodes
                if (a.isOwner && !b.isOwner) return -1
                if (!a.isOwner && b.isOwner) return 1
                return 0
            })
    }, [stargateNodes, ownedStargateNfts, userAddress, isLoadingNodes, isLoadingNfts])

    return {
        stakingGroups,
        isLoading: isLoadingNodes || isLoadingNfts,
        totalGroups: stakingGroups.length,
    }
}
