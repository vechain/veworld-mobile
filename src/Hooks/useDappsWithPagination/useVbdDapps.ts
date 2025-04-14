import { useCallback } from "react"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { PAGE_SIZE } from "./constants"
import { UseDappsWithPaginationFetch } from "./types"
import { fetchVBDMetadata, mapVBDDappToDiscoveryDapp, sortVBDDapps } from "./vbd.functions"

export const useVbdDapps = (enabled: boolean) => {
    const { data, isFetching: isFetchingVBD } = useVeBetterDaoDapps(enabled)

    const fetchWithPage: UseDappsWithPaginationFetch = useCallback(
        async ({ page, sort }) => {
            if (!data) return { page: [], hasMore: false }
            const sliced = [...data].sort(sortVBDDapps(sort)).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            const metadata = await Promise.all(sliced.map(fetchVBDMetadata))
            const returnPage = sliced.map((vbdDapp, idx) => mapVBDDappToDiscoveryDapp({ ...vbdDapp, ...metadata[idx] }))
            return {
                page: returnPage,
                hasMore: (page + 1) * PAGE_SIZE < data.length,
            }
        },
        [data],
    )

    return {
        dependencyLoading: isFetchingVBD,
        fetchWithPage,
    }
}
