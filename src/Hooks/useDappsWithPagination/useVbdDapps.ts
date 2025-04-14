import { useCallback } from "react"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { PAGE_SIZE } from "./constants"
import { UseDappsWithPaginationFetch } from "./types"
import { fetchVBDMetadata, mapVBDDappToDiscoveryDapp, sortVBDDapps } from "./vbd.functions"
import { useAppSelector, selectFeaturedDapps } from "~Storage/Redux"

export const useVbdDapps = (enabled: boolean) => {
    const appHubDapps = useAppSelector(selectFeaturedDapps)
    const { data, isFetching: isFetchingVBD } = useVeBetterDaoDapps(enabled)

    const fetchWithPage: UseDappsWithPaginationFetch = useCallback(
        async ({ page, sort }) => {
            if (!data) return { page: [], hasMore: false }
            const sliced = [...data].sort(sortVBDDapps(sort)).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            const returnPage = await Promise.all(
                sliced.map(async dapp => {
                    const foundAppHubDapp = appHubDapps.find(
                        app => app.veBetterDaoId?.toLowerCase() === dapp.id.toLowerCase(),
                    )
                    if (foundAppHubDapp) return foundAppHubDapp
                    const md = await fetchVBDMetadata(dapp)
                    return mapVBDDappToDiscoveryDapp({ ...dapp, ...md })
                }),
            )
            return {
                page: returnPage,
                hasMore: (page + 1) * PAGE_SIZE < data.length,
            }
        },
        [appHubDapps, data],
    )

    return {
        dependencyLoading: isFetchingVBD,
        fetchWithPage,
    }
}
