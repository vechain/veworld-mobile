import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import React from "react"
import { NodeManagement, UserNodesInfo } from "~Constants"
import { getStartgatNetworkConfig } from "~Constants/Constants/Staking"
import { useBlockchainNetwork } from "~Hooks/useBlockchainNetwork"
import { useThorClient } from "~Hooks/useThorClient"
import { NETWORK_TYPE, NodeInfo, RawNodeInfo } from "~Model"

export const getUserNodesQueryKey = (address?: string) => ["userNodes", address]

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
        const rawNodes = userNodesResult[0] as unknown as RawNodeInfo[]

        return await Promise.all(
            (rawNodes || []).map(async node => {
                const isLegacyResult = await isLegacyNodeContract.read.isLegacyNode(BigInt(node.nodeId))

                return {
                    ...node,
                    isLegacyNode: isLegacyResult[0],
                }
            }),
        )
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
        return getUserNodesQueryKey(address)
    }, [address])

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
