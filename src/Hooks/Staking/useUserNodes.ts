import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { NETWORK_TYPE, NodeInfo } from "~Model"
import { fetchStargateTokens } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { getTokenLevelId } from "~Utils/StargateUtils"

export const getUserNodesQueryKey = (network: NETWORK_TYPE, address?: string) => ["userStargateNodes", network, address]

const getUserNodes = async (networkType: NETWORK_TYPE, address: string | undefined): Promise<NodeInfo[]> => {
    if (!address) return []

    try {
        const r = await fetchStargateTokens(networkType, address)
        return r.data.map(u => ({
            isLegacyNode: false,
            nodeId: u.tokenId,
            nodeLevel: getTokenLevelId(u.level),
            xNodeOwner: u.owner,
            vetAmountStaked: u.vetStaked,
            accumulatedRewards: BigNutils(u.totalBootstrapRewardsClaimed).plus(u.totalRewardsClaimed).toString,
        }))
    } catch (error) {
        throw new Error(`Error fetching user nodes ${error}`)
    }
}

export const useUserNodes = (address?: string, _enabled: boolean = true) => {
    const network = useAppSelector(selectSelectedNetwork)

    const queryKey = React.useMemo(() => {
        return getUserNodesQueryKey(network.type, address)
    }, [address, network.type])

    const isValidNetwork = useMemo(() => [NETWORK_TYPE.MAIN, NETWORK_TYPE.TEST].includes(network.type), [network.type])

    const enabled = !!address && isValidNetwork && _enabled

    const { data, error, isError, isFetching } = useQuery({
        queryKey,
        queryFn: async () => await getUserNodes(network.type, address),
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
