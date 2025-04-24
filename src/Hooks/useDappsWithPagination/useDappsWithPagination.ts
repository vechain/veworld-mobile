import { useInfiniteQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { DAppType } from "~Model"
import { UseDappsWithPaginationFetchReturn, UseDappsWithPaginationSortKey } from "./types"
import { sortAppHubDapps, useAppHubDapps } from "./useAppHubDapps"
import { uniqBy } from "lodash"

type Args = {
    sort: UseDappsWithPaginationSortKey
    filter: DAppType
}
type QueryKey = ["USE_DAPPS_WITH_PAGINATION", UseDappsWithPaginationSortKey, DAppType]
type PageFn = (args: { pageParam: number; queryKey: QueryKey }) => Promise<UseDappsWithPaginationFetchReturn>

export const useDappsWithPagination = ({ sort, filter }: Args) => {
    const { fetchWithPage: fetchAppHubWithPage, dependencyLoading: appHubDependencyLoading } = useAppHubDapps(filter)

    const pageFunction: PageFn = useCallback(
        async ({ pageParam, queryKey: [_, _sort, _filter] }) => {
            return fetchAppHubWithPage({ page: pageParam, sort: _sort })
        },
        [fetchAppHubWithPage],
    )

    const {
        data: pages,
        isFetching,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["USE_DAPPS_WITH_PAGINATION", sort, filter] as QueryKey,
        queryFn: pageFunction,
        getNextPageParam: (_lastPage, _allPages, _lastPageParam) => {
            return _lastPage.hasMore ? _lastPageParam + 1 : null
        },
        initialPageParam: 0,
        enabled: !appHubDependencyLoading,
        retry(failureCount, error) {
            if (error.message === "FEATURED_DAPPS_NOT_LOADED_YET") return true
            return false
        },
        retryDelay: 500,
    })

    const isLoading = useMemo(() => {
        if (isFetching) return true
        return appHubDependencyLoading
    }, [appHubDependencyLoading, isFetching])

    const flattedData = useMemo(
        () => uniqBy(pages?.pages?.flatMap(({ page }) => page).sort(sortAppHubDapps(sort)), "href"),
        [pages?.pages, sort],
    )

    return {
        isLoading,
        data: flattedData,
        fetchNextPage,
    }
}
