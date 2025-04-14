import { useInfiniteQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { DAppType } from "~Model"
import { UseDappsWithPaginationFetchReturn, UseDappsWithPaginationSortKey } from "./types"
import { sortAppHubDapps, useAppHubDapps } from "./useAppHubDapps"
import { useVbdDapps } from "./useVbdDapps"

type Args = {
    sort: UseDappsWithPaginationSortKey
    filter: DAppType
}
type QueryKey = ["USE_DAPPS_WITH_PAGINATION", UseDappsWithPaginationSortKey, DAppType]
type PageFn = (args: { pageParam: number; queryKey: QueryKey }) => Promise<UseDappsWithPaginationFetchReturn>

export const useDappsWithPagination = ({ sort, filter }: Args) => {
    const { fetchWithPage: fetchAppHubWithPage, dependencyLoading: appHubDependencyLoading } = useAppHubDapps(filter)
    const { fetchWithPage: fetchVbdWithPage, dependencyLoading: vbdDependencyLoading } = useVbdDapps(
        filter === DAppType.SUSTAINABILTY,
    )

    const pageFunction: PageFn = useCallback(
        async ({ pageParam, queryKey: [_, _sort, _filter] }) => {
            if (_filter === DAppType.SUSTAINABILTY) return fetchVbdWithPage({ page: pageParam, sort: _sort })
            return fetchAppHubWithPage({ page: pageParam, sort: _sort })
        },
        [fetchAppHubWithPage, fetchVbdWithPage],
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
    })

    const isLoading = useMemo(() => {
        if (isFetching) return true
        if (filter === DAppType.SUSTAINABILTY) return vbdDependencyLoading
        return appHubDependencyLoading
    }, [appHubDependencyLoading, filter, isFetching, vbdDependencyLoading])

    const flattedData = useMemo(
        () => pages?.pages?.flatMap(({ page }) => page).sort(sortAppHubDapps(sort)),
        [pages?.pages, sort],
    )

    return {
        isLoading,
        data: flattedData,
        fetchNextPage,
    }
}
