import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { FetchAppOverviewResponse } from "~Networking/API/Types"
import { fetchAppOverview } from "~Networking/DApps/fetchAppOverview"

/**
 * Hook to batch fetch app overviews for multiple apps with React Query
 * @param appIds - Array of app IDs to fetch overviews for
 * @param enabled - Whether to enable the queries
 * @returns Object with overview data keyed by appId and loading states
 */
export const useBatchAppOverviews = (appIds: string[], enabled = true) => {
    const queries = useQueries({
        queries: appIds.map(appId => ({
            queryKey: ["appOverview", appId],
            queryFn: () => fetchAppOverview(appId),
            enabled: enabled && !!appId,
            staleTime: 1000 * 60 * 60 * 24,
            gcTime: 1000 * 60 * 60 * 24,
        })),
    })

    return useMemo(() => {
        const overviews: Record<string, FetchAppOverviewResponse | undefined> = {}
        const isLoading = queries.some(query => query.isLoading)
        const hasErrors = queries.some(query => query.isError)

        queries.forEach((query, index) => {
            const appId = appIds[index]
            if (appId) {
                overviews[appId] = query.data
            }
        })

        return {
            overviews,
            isLoading,
            hasErrors,
            queries,
        }
    }, [queries, appIds])
}
