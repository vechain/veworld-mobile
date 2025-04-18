import { DiscoveryDApp } from "~Constants"

export type UseDappsWithPaginationSortKey = "alphabetic_asc" | "alphabetic_desc" | "newest"

export type UseDappsWithPaginationFetchArgs = {
    page: number
    sort: UseDappsWithPaginationSortKey
}

export type UseDappsWithPaginationFetchReturn = {
    page: DiscoveryDApp[]
    hasMore: boolean
}

export type UseDappsWithPaginationFetch = (
    args: UseDappsWithPaginationFetchArgs,
) => Promise<UseDappsWithPaginationFetchReturn>
