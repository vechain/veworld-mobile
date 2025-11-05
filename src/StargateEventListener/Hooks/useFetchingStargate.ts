import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { selectSelectedAccountOrNull, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { debug } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import { useStargateConfig } from "~Hooks/useStargateConfig"

/**
 * Hook for managing Stargate data refetching
 * This will be primarily used to trigger refetches when NodeDelegated events are detected
 */
export const useFetchingStargate = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const queryClient = useQueryClient()
    const stargateConfig = useStargateConfig(network)

    const refetchStargateData = useCallback(
        async (targetAddress?: string) => {
            if (!stargateConfig) {
                debug(ERROR_EVENTS.STARGATE, `No Stargate configuration found for network: ${network.type}`)
                return
            }

            // If no target address is provided and no account is selected, return early
            if (!targetAddress && !selectedAccount?.address) {
                debug(ERROR_EVENTS.STARGATE, "No target address provided and no account selected, skipping refetch")
                return
            }

            const accountToInvalidate = targetAddress || selectedAccount!.address
            debug(
                ERROR_EVENTS.STARGATE,
                "Stargate data refetch triggered for network:",
                network.type,
                "account:",
                accountToInvalidate,
            )

            try {
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
        [stargateConfig, selectedAccount, network.type, queryClient],
    )

    return {
        refetchStargateData,
    }
}
