import { useQueries } from "@tanstack/react-query"
import { BigNumber, ethers } from "ethers"
import { useMemo } from "react"
import { getVTHORewardPerBlockPerNFTLevel } from "~Constants"
import { useLevelCirculatingSupplies } from "~Hooks/Staking"
import { useMainnetIndexerClient } from "~Hooks/useIndexerClient"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getStargateTotalSupplyKey = () => ["STARGATE_TOTAL_SUPPLY"]
export const getStargateTotalVetStakedKey = () => ["STARGATE_TOTAL_VET_STAKED"]
export const getStargateRewardsDistributedKey = () => ["STARGATE_REWARDS_DISTRIBUTED"]

const BLOCKS_PER_DAY = 8640 // 24 hours * 3600 seconds / 10 seconds per block

export const useStargateStats = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const { data: circulatingSupplies, isLoading: circulatingSuppliesLoading } = useLevelCirculatingSupplies()
    const indexer = useMainnetIndexerClient()

    // Calculate total VTHO rewards per day based on circulating supplies and reward rates
    const vthoPerDay = useMemo(() => {
        const rewardPerBlockPerNFTLevel = getVTHORewardPerBlockPerNFTLevel(selectedNetwork.type)
        if (circulatingSuppliesLoading || !circulatingSupplies || !rewardPerBlockPerNFTLevel) {
            return 0
        }

        let totalVthoPerDay = 0

        circulatingSupplies.forEach((circulatingSupply: number, index: number) => {
            if (circulatingSupply <= 0) return

            // Level ID is 1-indexed, so add 1 to the array index
            const levelId = index + 1

            // Find the reward rate for this level from the config
            const levelRewardConfig = rewardPerBlockPerNFTLevel.find(
                (reward: { levelId: number; rewardPerBlock: BigNumber }) => reward.levelId === levelId,
            )

            if (levelRewardConfig) {
                // Convert reward per block from wei to ether
                const rewardPerBlockInEther = Number(ethers.utils.formatEther(levelRewardConfig.rewardPerBlock))

                // Calculate daily rewards: supply * reward per block * blocks per day
                const dailyRewards = circulatingSupply * rewardPerBlockInEther * BLOCKS_PER_DAY
                totalVthoPerDay += dailyRewards
            }
        })

        return totalVthoPerDay
    }, [circulatingSupplies, circulatingSuppliesLoading, selectedNetwork.type])

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
                queryFn: () => indexer.GET("/api/v1/stargate/total-vtho-claimed").then(res => res.data!),
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
                          vthoPerDay: vthoPerDay,
                      },
            }
        },
    })
}
