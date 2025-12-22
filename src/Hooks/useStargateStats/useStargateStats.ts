import { useQueries } from "@tanstack/react-query"
import { useMainnetIndexerClient } from "~Hooks/useIndexerClient"

export const getStargateTotalSupplyKey = () => ["STARGATE_TOTAL_SUPPLY"]
export const getStargateTotalVetStakedKey = () => ["STARGATE_TOTAL_VET_STAKED"]
export const getStargateRewardsDistributedKey = () => ["STARGATE_REWARDS_DISTRIBUTED"]
export const getStargateVthoPerDayKey = () => ["STARGATE_VTHO_PER_DAY"]

export const useStargateStats = () => {
    const indexer = useMainnetIndexerClient()

    return useQueries({
        queries: [
            {
                queryKey: getStargateTotalSupplyKey(),
                queryFn: () => indexer.GET("/api/v1/stargate/nft-holders").then(res => res.data!),
            },
            {
                queryKey: getStargateTotalVetStakedKey(),
                queryFn: () => indexer.GET("/api/v1/stargate/total-vet-staked").then(res => res.data!),
            },
            {
                queryKey: getStargateRewardsDistributedKey(),
                queryFn: () =>
                    indexer
                        .GET("/api/v1/stargate/total-vtho-claimed", {
                            params: { query: { rewardsType: "DELEGATION" } },
                        })
                        .then(res => res.data!),
            },
            {
                queryKey: getStargateVthoPerDayKey(),
                queryFn: () =>
                    indexer
                        .GET("/api/v1/stargate/total-vtho-generated/historic/{range}", {
                            params: { path: { range: "1-day" } },
                        })
                        .then(res => {
                            const data = res.data!
                            if (data.length === 0) return "0"
                            return data[data.length - 1].value.toString()
                        }),
            },
        ],
        combine(results) {
            return {
                isLoading: results.some(result => result.isLoading),
                data: results.some(result => !result.data)
                    ? undefined
                    : {
                          totalSupply: results[0].data,
                          totalVetStaked: results[1].data,
                          rewardsDistributed: results[2].data,
                          vthoPerDay: results[3].data,
                      },
            }
        },
    })
}
