import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { getStargateNetworkConfig } from "~Constants/Constants/Staking"
import { debug } from "~Utils"
import { ERROR_EVENTS } from "~Constants"

/**
 * Hook for managing Stargate data refetching
 * This will be primarily used to trigger refetches when NodeDelegated events are detected
 */
export const useFetchingStargate = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const queryClient = useQueryClient()

    const refetchStargateData = useCallback(
        async (targetAddress?: string) => {
            const networkConfig = getStargateNetworkConfig(network.type)

            if (!networkConfig) {
                debug(ERROR_EVENTS.STARGATE, `No Stargate configuration found for network: ${network.type}`)
                return
            }

            const accountToInvalidate = targetAddress || selectedAccount.address
            debug(
                ERROR_EVENTS.STARGATE,
                "Stargate data refetch triggered for network:",
                network.type,
                "account:",
                accountToInvalidate,
            )

            try {
                // Get all matching queries before invalidation
                const matchingQueries = queryClient.getQueriesData({
                    predicate(query) {
                        const matches =
                            ["userStargateNodes", "userStargateNfts"].includes(query.queryKey[0] as string) &&
                            query.queryKey.length >= 3 &&
                            query.queryKey[1] === network.type &&
                            query.queryKey[2] === accountToInvalidate

                        if (matches) {
                            debug(ERROR_EVENTS.STARGATE, "Found matching query to invalidate:", query.queryKey)
                        }
                        return matches
                    },
                })

                debug(ERROR_EVENTS.STARGATE, `Found ${matchingQueries.length} queries to invalidate`)

                // Invalidate and refetch all Stargate-related queries for the target network and account
                // Using refetchType: 'all' eliminates the need for a separate refetchQueries call
                await queryClient.invalidateQueries({
                    predicate(query) {
                        // Only invalidate userStargateNodes and userStargateNfts queries
                        if (!["userStargateNodes", "userStargateNfts"].includes(query.queryKey[0] as string))
                            return false

                        // Ensure query has enough parameters
                        if (query.queryKey.length < 3) return false

                        // Match current network
                        if (query.queryKey[1] !== network.type) return false

                        // Match target account address
                        const queryAddress = query.queryKey[2] as string | undefined
                        if (!queryAddress || queryAddress !== accountToInvalidate) return false

                        debug(ERROR_EVENTS.STARGATE, "Invalidating and refetching query:", query.queryKey)
                        return true
                    },
                    refetchType: "all",
                })

                debug(
                    ERROR_EVENTS.STARGATE,
                    "Successfully invalidated and refetched Stargate queries for account:",
                    accountToInvalidate,
                )
            } catch (error) {
                debug(ERROR_EVENTS.STARGATE, "Error invalidating Stargate queries:", error)
            }
        },
        [network.type, selectedAccount.address, queryClient],
    )

    return {
        refetchStargateData,
    }
}
