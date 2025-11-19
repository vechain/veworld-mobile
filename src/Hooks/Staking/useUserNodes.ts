import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { useIndexerUrl } from "~Hooks/useIndexerUrl"
import { NodeInfo } from "~Model"
import { fetchStargateTokens } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { getTokenLevelId } from "~Utils/StargateUtils"

export const getUserNodesQueryKey = (genesisId: string, address?: string) => ["userStargateNodes", genesisId, address]

const getUserNodes = async (baseUrl: string, address: string | undefined): Promise<NodeInfo[]> => {
    if (!address) return []

    const results: NodeInfo[] = []
    let page = 0
    try {
        while (true) {
            const r = await fetchStargateTokens(baseUrl, address, { page })
            results.push(
                ...r.data.map(u => ({
                    isLegacyNode: false,
                    nodeId: u.tokenId,
                    nodeLevel: getTokenLevelId(u.level),
                    xNodeOwner: u.owner,
                    vetAmountStaked: u.vetStaked,
                    accumulatedRewards: BigNutils(u.totalBootstrapRewardsClaimed).plus(u.totalRewardsClaimed).toString,
                })),
            )
            if (!r.pagination.hasNext) break
            page++
        }
        return results
    } catch (error) {
        throw new Error(`Error fetching user nodes ${error}`)
    }
}

export const useUserNodes = (address?: string, _enabled: boolean = true) => {
    const network = useAppSelector(selectSelectedNetwork)

    const queryKey = React.useMemo(() => {
        return getUserNodesQueryKey(network.genesis.id, address)
    }, [address, network.genesis.id])

    const indexerUrl = useIndexerUrl(network)
    const enabled = !!address && !!indexerUrl && _enabled

    const { data, error, isError, isFetching } = useQuery({
        queryKey,
        queryFn: async () => await getUserNodes(indexerUrl!, address),
        enabled,
        staleTime: 60 * 5 * 1000,
        gcTime: Infinity,
    })

    return useMemo(
        () => ({
            data: data ?? [],
            isLoading: isFetching,
            error,
            isError,
        }),
        [data, error, isError, isFetching],
    )
}
