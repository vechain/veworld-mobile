import { useQuery } from "@tanstack/react-query"
import { FetchAppOverviewResponse } from "~Networking/API/Types"
import { fetchAppOverview } from "~Networking/DApps/fetchAppOverview"

/**
 * Hook to fetch app overview data with React Query caching
 * @param appId - The app ID to fetch overview for
 * @param enabled - Whether to enable the query
 * @returns React Query result with app overview data
 */
export const useAppOverview = (appId: string | undefined, enabled = true) => {
    return useQuery<FetchAppOverviewResponse>({
        queryKey: ["appOverview", appId],
        queryFn: () => {
            if (!appId) {
                throw new Error("App ID is required")
            }
            return fetchAppOverview(appId)
        },
        enabled: enabled && !!appId,
        staleTime: 1000 * 60 * 60 * 24,
    })
}
