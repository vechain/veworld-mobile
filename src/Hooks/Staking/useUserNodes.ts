import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import React from "react"
import { NodeManagement, UserNodesInfo } from "~Constants"
import { getStargateNetworkConfig } from "~Constants/Constants/Staking"
import { useThorClient } from "~Hooks/useThorClient"
import { NETWORK_TYPE, NodeInfo } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getUserNodesQueryKey = (network: NETWORK_TYPE, address?: string) => ["userStargateNodes", network, address]

export const getUserNodes = async (
    thor: ThorClient,
    address?: string,
    nodeManagementAddress?: string,
): Promise<NodeInfo[]> => {
    if (!address || !nodeManagementAddress) return []

    try {
        const userNodesContract = thor.contracts.load(nodeManagementAddress, [UserNodesInfo.getUserNodes])
        const isLegacyNodeContract = thor.contracts.load(nodeManagementAddress, [NodeManagement.isLegacyNode])

        const userNodesResult = await userNodesContract.read.getUserNodes(address)
        const rawNodes = userNodesResult[0]

        if (!rawNodes || rawNodes.length === 0) return []
        const clauses = rawNodes.map(node => isLegacyNodeContract.clause.isLegacyNode(BigInt(node.nodeId)))
        const result = await thor.transactions.executeMultipleClausesCall(clauses)

        return rawNodes.map((node, idx) => {
            return {
                ...node,
                nodeId: node.nodeId.toString(),
                isLegacyNode: result[idx].result.plain as boolean,
            } satisfies NodeInfo
        })
    } catch (error) {
        throw new Error(`Error fetching user nodes ${error}`)
    }
}

export const useUserNodes = (address?: string, _enabled: boolean = true) => {
    const thor = useThorClient()
    const network = useAppSelector(selectSelectedNetwork)

    const nodeManagementAddress = React.useMemo(() => {
        return getStargateNetworkConfig(network.type)?.NODE_MANAGEMENT_CONTRACT_ADDRESS
    }, [network.type])

    const queryKey = React.useMemo(() => {
        return getUserNodesQueryKey(network.type, address)
    }, [address, network.type])

    const enabled = !!thor && !!address && !!nodeManagementAddress && _enabled

    const { data, error, isError, isFetching } = useQuery({
        queryKey,
        queryFn: async () => await getUserNodes(thor, address, nodeManagementAddress),
        enabled,
        staleTime: 60 * 5 * 1000,
    })

    const stargateNodes = React.useMemo(() => data?.filter(node => !node.isLegacyNode) || [], [data])

    return {
        data,
        stargateNodes,
        isLoading: isFetching,
        error,
        isError,
    }
}
