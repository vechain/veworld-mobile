import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { IndexerClient, useIndexerClient } from "~Hooks/useIndexerClient"
import { NodeInfo } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { getTokenLevelId, StargateLevelName } from "~Utils/StargateUtils"

export const getNodeByTokenIdQueryKey = (genesisId: string, tokenId?: string) => [
    "userStargateNodes",
    genesisId,
    tokenId,
]

const getNodeByTokenId = async (indexer: IndexerClient, tokenId: string): Promise<NodeInfo | undefined> => {
    if (!tokenId) return undefined

    try {
        const r = await indexer
            .GET("/api/v1/stargate/tokens", {
                params: {
                    query: {
                        tokenId: tokenId,
                    },
                },
            })
            .then(res => res.data!)

        if (r.data.length === 0) return undefined

        return {
            isLegacyNode: false,
            nodeId: tokenId,
            nodeLevel: getTokenLevelId(r.data[0].level as StargateLevelName),
            xNodeOwner: r.data[0].owner,
            vetAmountStaked: r.data[0].vetStaked.toString(),
            accumulatedRewards: BigNutils(r.data[0].totalBootstrapRewardsClaimed).plus(r.data[0].totalRewardsClaimed)
                .toString,
        }
    } catch (error) {
        throw new Error(`Error fetching node by token id ${error}`)
    }
}

export const useNodesByTokenId = (tokenId: string, _enabled: boolean = true) => {
    const network = useAppSelector(selectSelectedNetwork)

    const queryKey = React.useMemo(() => {
        return getNodeByTokenIdQueryKey(network.genesis.id, tokenId)
    }, [tokenId, network.genesis.id])

    const indexer = useIndexerClient(network)
    const enabled = !!tokenId && _enabled

    const { data, error, isError, isFetching } = useQuery({
        queryKey,
        queryFn: async () => await getNodeByTokenId(indexer, tokenId),
        enabled,
        staleTime: 60 * 5 * 1000,
    })

    return useMemo(
        () => ({
            data,
            isLoading: isFetching,
            error,
            isError,
        }),
        [data, error, isError, isFetching],
    )
}
