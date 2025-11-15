import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils, debug } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import { useStargateConfig } from "~Hooks/useStargateConfig"

/**
 * Hook for managing Stargate data refetching
 * This will be primarily used to trigger refetches when NodeDelegated events are detected
 */
export const useStargateInvalidation = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const queryClient = useQueryClient()
    const stargateConfig = useStargateConfig(network)

    const invalidate = useCallback(
        async (addresses: string[]) => {
            if (!stargateConfig) {
                debug(ERROR_EVENTS.STARGATE, `No Stargate configuration found for network: ${network.type}`)
                return
            }

            // If no addresses are provided, return early
            if (addresses.length === 0) {
                debug(ERROR_EVENTS.STARGATE, "No addresses provided, skipping refetch")
                return
            }

            try {
                await queryClient.invalidateQueries({
                    predicate(query) {
                        const queryKey = query.queryKey as string[]
                        if (!["userStargateNodes", "userStargateNfts", "STARGATE_CLAIMABLE"].includes(queryKey[0]))
                            return false
                        if (queryKey.length < 3) return false
                        if (![network.type, network.genesis.id].includes(queryKey[1])) return false
                        if (!addresses.some(addr => AddressUtils.compareAddresses(addr, queryKey[2]))) return false
                        return true
                    },
                })
            } catch (error) {
                debug(ERROR_EVENTS.STARGATE, "Error invalidating Stargate queries:", error)
            }
        },
        [stargateConfig, network.type, network.genesis.id, queryClient],
    )

    return {
        invalidate,
    }
}
