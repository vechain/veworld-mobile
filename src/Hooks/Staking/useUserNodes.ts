import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import React from "react"
import { NodeManagement, UserNodesInfo } from "~Constants"
import { getStartgatNetworkConfig } from "~Constants/Constants/Staking"
import { useBlockchainNetwork } from "~Hooks/useBlockchainNetwork"
import { useThorClient } from "~Hooks/useThorClient"
import { NETWORK_TYPE, NodeInfo } from "~Model"

export const getUserNodesQueryKey = (network: NETWORK_TYPE, address?: string) => ["userNodes", address]

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

export const useUserNodes = (address?: string) => {
    const thor = useThorClient()
    const { network } = useBlockchainNetwork()

    const networkType = React.useMemo(() => {
        return network.type === NETWORK_TYPE.MAIN ? "mainnet" : "testnet"
    }, [network.type])

    const nodeManagementAddress = React.useMemo(() => {
        return getStartgatNetworkConfig(networkType)?.NODE_MANAGEMENT_CONTRACT_ADDRESS
    }, [networkType])

    const queryKey = React.useMemo(() => {
        return getUserNodesQueryKey(network.type, address)
    }, [address, network.type])

    const enabled = !!thor && !!address && !!nodeManagementAddress

    const { data, isLoading, error, isError } = useQuery({
        queryKey,
        queryFn: async () => await getUserNodes(thor, address, nodeManagementAddress),
        enabled,
        staleTime: 60000,
    })

    const stargateNodes = React.useMemo(() => data?.filter(node => !node.isLegacyNode) || [], [data])

    return {
        data,
        stargateNodes,
        isLoading,
        error,
        isError,
    }
}
