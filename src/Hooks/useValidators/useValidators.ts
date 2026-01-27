import { useQuery } from "@tanstack/react-query"
import { components } from "~Generated/indexer/schema"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectSelectedNetwork } from "~Storage/Redux/Selectors"

export const getValidatorsQueryKey = (genesisId: string) => ["validators", genesisId]

/**
 * Get all validators for a network
 * @returns {QueryResult<components["schemas"]["PaginatedResponseValidator"]["data"], Error>}
 */
export const useValidators = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const indexerClient = useIndexerClient(network)

    return useQuery({
        queryKey: getValidatorsQueryKey(network.genesis.id),
        queryFn: async () => {
            let hasNextPage = true
            let page = 0
            const results: components["schemas"]["PaginatedResponseValidator"]["data"] = []

            while (hasNextPage) {
                try {
                    const response = await indexerClient.GET("/api/v1/validators", {
                        params: {
                            query: {
                                page,
                                size: 100,
                            },
                        },
                    })
                    results.push(...(response?.data?.data ?? []))
                    hasNextPage = response?.data?.pagination.hasNext ?? false
                    page++
                } catch (error) {
                    throw new Error(`Failed to fetch Stargate validators: ${error}`)
                }
            }
            return results
        },
        staleTime: 1000 * 60 * 60 * 24,
    })
}
