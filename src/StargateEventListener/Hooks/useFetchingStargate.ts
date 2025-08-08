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

    const refetchStargateData = useCallback(async () => {
        const networkConfig = getStargateNetworkConfig(network.type)

        if (!networkConfig) {
            debug(ERROR_EVENTS.STARGATE, `No Stargate configuration found for network: ${network.type}`)
            return
        }

        debug(ERROR_EVENTS.STARGATE, "Stargate data refetch triggered for network:", network.type)

        try {
            // Invalidate all Stargate-related queries for the current network and account
            // This follows the same pattern as HomeScreen's invalidateStargateQueries
            await queryClient.invalidateQueries({
                predicate(query) {
                    // Only invalidate userStargateNodes and userStargateNfts queries
                    if (!["userStargateNodes", "userStargateNfts"].includes(query.queryKey[0] as string)) return false

                    // Ensure query has enough parameters
                    if (query.queryKey.length < 3) return false

                    // Match current network
                    if (query.queryKey[1] !== network.type) return false

                    // Match current account address (for userStargateNodes) or any account (for userStargateNfts)
                    const queryAddress = query.queryKey[2] as string | undefined
                    if (!queryAddress || queryAddress !== selectedAccount.address) return false

                    return true
                },
            })

            // Additional explicit invalidations are not required; the predicate above handles it

            debug(
                ERROR_EVENTS.STARGATE,
                "Successfully invalidated Stargate queries for account:",
                selectedAccount.address,
            )
        } catch (error) {
            debug(ERROR_EVENTS.STARGATE, "Error invalidating Stargate queries:", error)
        }
    }, [network.type, selectedAccount.address, queryClient])

    return {
        refetchStargateData,
    }
}
