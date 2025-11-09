import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import React from "react"
import { NodeManagement, StargateInfo, UserNodesInfo } from "~Constants"
import { StargateConfiguration, useStargateConfig } from "~Hooks/useStargateConfig"
import { useThorClient } from "~Hooks/useThorClient"
import { NETWORK_TYPE, NodeInfo } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import ThorUtils from "~Utils/ThorUtils"

export const getUserNodesQueryKey = (network: NETWORK_TYPE, address?: string) => ["userStargateNodes", network, address]

/**
 * Get the user nodes pre-hayabusa
 * @param thor Thor client
 * @param address Address of the user
 * @param config Stargate configuration
 * @returns User nodes (pre-Hayabusa)
 */
const getUserNodesLegacy = async (thor: ThorClient, address: string, config: StargateConfiguration) => {
    const userNodesContract = thor.contracts.load(config.NODE_MANAGEMENT_CONTRACT_ADDRESS!, [
        UserNodesInfo.getUserNodes,
    ])
    const isLegacyNodeContract = thor.contracts.load(config.NODE_MANAGEMENT_CONTRACT_ADDRESS!, [
        NodeManagement.isLegacyNode,
    ])

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
}

/**
 * Get the user nodes post-hayabusa
 * @param thor Thor client
 * @param address Address of the user
 * @param config Stargate configuration
 * @returns User nodes (post-Hayabusa)
 */
const getUserNodesHayabusa = async (thor: ThorClient, address: string, config: StargateConfiguration) => {
    const r = await ThorUtils.clause.executeMultipleClausesCall(
        thor,
        ThorUtils.clause.getContractClauseOfMethod(
            config.STARGATE_NFT_CONTRACT_ADDRESS!,
            [StargateInfo.tokensOverview],
            "tokensOverview",
            [address as `0x${string}`],
        ),
    )

    ThorUtils.clause.assertMultipleClausesCallSuccess(r, () => {
        throw new Error("[getUserNodesHayabusa]: Clause reverted")
    })

    return r[0].result.plain.map(
        element =>
            ({
                isLegacyNode: false,
                nodeId: element.id.toString(),
                nodeLevel: element.levelId,
                xNodeOwner: element.owner,
            } satisfies NodeInfo),
    )
}

const getUserNodes = async (
    thor: ThorClient,
    address: string | undefined,
    config: StargateConfiguration,
): Promise<NodeInfo[]> => {
    if (!address || Object.keys(config).length === 0) return []

    try {
        if (config.STARGATE_CONTRACT_ADDRESS) return await getUserNodesHayabusa(thor, address, config)
        return await getUserNodesLegacy(thor, address, config)
    } catch (error) {
        throw new Error(`Error fetching user nodes ${error}`)
    }
}

export const useUserNodes = (address?: string, _enabled: boolean = true) => {
    const thor = useThorClient()
    const network = useAppSelector(selectSelectedNetwork)
    const stargateConfig = useStargateConfig(network)

    const queryKey = React.useMemo(() => {
        return getUserNodesQueryKey(network.type, address)
    }, [address, network.type])

    const enabled = !!thor && !!address && Object.keys(stargateConfig).length > 0 && _enabled

    const { data, error, isError, isFetching } = useQuery({
        queryKey,
        queryFn: async () => await getUserNodes(thor, address, stargateConfig),
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
