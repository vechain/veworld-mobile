import { useMemo } from "react"
import { useUserNodes } from "./useUserNodes"
import { NodeInfo } from "~Model/Staking"
import { AddressUtils } from "~Utils"

export interface StakingGroup {
    /** User address for owned nodes, or first managed node's owner address for managed group */
    address: string
    /** Nodes for this group */
    nodes: NodeInfo[]
    /** Whether user is owner (vs just manager) */
    isOwner: boolean
    /** Loading state */
    isLoading: boolean
}

export const useGroupedStakingData = (userAddress?: string) => {
    const { data, isLoading: isLoadingNodes } = useUserNodes(userAddress)

    const stakingGroups = useMemo((): StakingGroup[] => {
        if (!data.length) return []

        // Separate owned and managed nodes
        const ownedNodes: NodeInfo[] = []
        const managedNodes: NodeInfo[] = []

        data.forEach(node => {
            if (AddressUtils.compareAddresses(node.xNodeOwner, userAddress)) {
                ownedNodes.push(node)
            } else {
                managedNodes.push(node)
            }
        })

        const groups: StakingGroup[] = []

        // Create owned group if there are owned nodes
        if (ownedNodes.length > 0) {
            groups.push({
                address: userAddress || "",
                nodes: ownedNodes,
                isOwner: true,
                isLoading: isLoadingNodes,
            })
        }

        // Create managed group if there are managed nodes
        if (managedNodes.length > 0) {
            groups.push({
                address: managedNodes[0].xNodeOwner,
                nodes: managedNodes,
                isOwner: false,
                isLoading: isLoadingNodes,
            })
        }

        return groups
    }, [data, userAddress, isLoadingNodes])

    return {
        stakingGroups,
        isLoading: isLoadingNodes,
        totalGroups: stakingGroups.length,
    }
}
