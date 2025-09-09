import { useMemo } from "react"
import { useUserNodes } from "./useUserNodes"
import { useUserStargateNfts } from "./useUserStargateNfts"
import { NftData, NodeInfo } from "~Model/Staking"
import { AddressUtils } from "~Utils"

export interface StakingGroup {
    /** User address for owned nodes, or first managed node's owner address for managed group */
    address: string
    /** Nodes for this group */
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

        // Separate owned and managed nodes
        const ownedNodes: NodeInfo[] = []
        const managedNodes: NodeInfo[] = []

        stargateNodes.forEach(node => {
            if (AddressUtils.compareAddresses(node.xNodeOwner, userAddress)) {
                ownedNodes.push(node)
            } else {
                managedNodes.push(node)
            }
        })

        const groups: StakingGroup[] = []

        // Create owned group if there are owned nodes
        if (ownedNodes.length > 0) {
            const ownedNodeIds = new Set(ownedNodes.map(n => n.nodeId))
            const ownedNfts = ownedStargateNfts.filter(nft => ownedNodeIds.has(nft.tokenId))

            groups.push({
                address: userAddress || "",
                nodes: ownedNodes,
                nfts: ownedNfts,
                isOwner: true,
                isLoading: isLoadingNodes || isLoadingNfts,
            })
        }

        // Create managed group if there are managed nodes
        if (managedNodes.length > 0) {
            const managedNodeIds = new Set(managedNodes.map(n => n.nodeId))
            const managedNfts = ownedStargateNfts.filter(nft => managedNodeIds.has(nft.tokenId))

            groups.push({
                address: managedNodes[0].xNodeOwner,
                nodes: managedNodes,
                nfts: managedNfts,
                isOwner: false,
                isLoading: isLoadingNodes || isLoadingNfts,
            })
        }

        return groups
    }, [stargateNodes, ownedStargateNfts, userAddress, isLoadingNodes, isLoadingNfts])

    return {
        stakingGroups,
        isLoading: isLoadingNodes || isLoadingNfts,
        totalGroups: stakingGroups.length,
    }
}
