import { useQuery } from "@tanstack/react-query"
import { useMainnetIndexerClient } from "~Hooks/useIndexerClient"

/**
 * Hook to fetch app overview data with React Query caching
 * @param appId - The app ID to fetch overview for
 * @param enabled - Whether to enable the query
 * @returns React Query result with app overview data
 */
export const useAppOverview = (appId: string | undefined, enabled = true) => {
    const indexer = useMainnetIndexerClient()
    return useQuery({
        queryKey: ["appOverview", appId],
        queryFn: () => {
            if (!appId) {
                throw new Error("App ID is required")
            }
            return indexer
                .GET("/api/v1/b3tr/actions/apps/{appId}/overview", {
                    params: {
                        path: {
                            appId,
                        },
                    },
                })
                .then(res => res.data!)
        },
        enabled: enabled && !!appId,
        staleTime: 1000 * 60 * 60 * 24,
    })
}
