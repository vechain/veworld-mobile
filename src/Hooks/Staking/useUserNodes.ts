import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { IndexerClient, useIndexerClient } from "~Hooks/useIndexerClient"
import { NodeInfo } from "~Model"
import { DEFAULT_PAGE_SIZE } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { getTokenLevelId } from "~Utils/StargateUtils"

export const getUserNodesQueryKey = (genesisId: string, address?: string) => ["userStargateNodes", genesisId, address]

const getUserNodes = async (indexer: IndexerClient, address: string | undefined): Promise<NodeInfo[]> => {
    if (!address) return []

    const results: NodeInfo[] = []
    let page = 0
    try {
        while (true) {
            const r = await indexer
                .GET("/api/v1/stargate/tokens", {
                    params: {
                        query: {
                            manager: address,
                            owner: address,
                            page,
                            size: DEFAULT_PAGE_SIZE,
                        },
                    },
                })
                .then(res => res.data!)
            results.push(
                ...r.data.map(u => ({
                    isLegacyNode: false,
                    nodeId: u.tokenId,
                    nodeLevel: getTokenLevelId(u.level as Exclude<typeof u.level, "All">),
                    xNodeOwner: u.owner,
                    vetAmountStaked: u.vetStaked.toString(),
                    accumulatedRewards: BigNutils(u.totalBootstrapRewardsClaimed).plus(u.totalRewardsClaimed).toString,
                    delegationStatus: u.delegationStatus ?? "NONE",
                    validatorId: u.validatorId ?? null,
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

    const indexer = useIndexerClient(network)
    const enabled = !!address && _enabled

    const { data, error, isError, isFetching } = useQuery({
        queryKey,
        queryFn: async () => await getUserNodes(indexer, address),
        enabled,
        staleTime: 60 * 5 * 1000,
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
