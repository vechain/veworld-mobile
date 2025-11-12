import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { NodeInfo } from "~Model"
import { fetchStargateTokens } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { getTokenLevelId } from "~Utils/StargateUtils"

export const getUserNodesQueryKey = (genesisId: string, address?: string) => ["userStargateNodes", genesisId, address]

const getUserNodes = async (genesisId: string, address: string | undefined): Promise<NodeInfo[]> => {
    if (!address) return []

    try {
        const r = await fetchStargateTokens(genesisId, address)
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
        return getUserNodesQueryKey(network.genesis.id, address)
    }, [address, network.genesis.id])

    const isValidNetwork = useMemo(
        () =>
            [
                defaultMainNetwork.genesis.id,
                defaultTestNetwork.genesis.id,
                //Hayabusa DEVNET
                "0x0000000081b0e5dc4decce0579106706333293e1acb1a3969f4fb4f5a47ef79c",
            ].includes(network.genesis.id),
        [network.genesis.id],
    )

    const enabled = !!address && isValidNetwork && _enabled

    const { data, error, isError, isFetching } = useQuery({
        queryKey,
        queryFn: async () => await getUserNodes(network.genesis.id, address),
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
