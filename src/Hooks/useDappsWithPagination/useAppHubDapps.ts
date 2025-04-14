import { useCallback, useMemo } from "react"
import { DiscoveryDApp } from "~Constants"
import { DAppType } from "~Model"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { PAGE_SIZE } from "./constants"
import { UseDappsWithPaginationFetch, UseDappsWithPaginationSortKey } from "./types"

const sortAppHubDapps = (sort: UseDappsWithPaginationSortKey) => (a: DiscoveryDApp, b: DiscoveryDApp) => {
    switch (sort) {
        case "alphabetic_asc":
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        case "alphabetic_desc":
            return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1
        case "newest":
            return new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
    }
}

const filterDapps = (filter: DAppType) => (dapp: DiscoveryDApp) => {
    switch (filter) {
        case DAppType.ALL:
            return true
        case DAppType.SUSTAINABILTY:
            return false
        case DAppType.NFT:
            return dapp.tags?.includes(DAppType.NFT.toLowerCase())

        case DAppType.DAPPS:
            return (
                !dapp.tags?.includes(DAppType.NFT.toLowerCase()) &&
                !dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase())
            )
    }
}

export const useAppHubDapps = (filter: DAppType) => {
    const dapps = useAppSelector(selectFeaturedDapps)

    const mappedDapps = useMemo(
        () =>
            dapps
                .map(dapp => ({
                    ...dapp,
                    tags: dapp.tags?.map(tag => tag.toLowerCase()),
                }))
                .filter(filterDapps(filter)),
        [dapps, filter],
    )

    const _fetchWithPage: UseDappsWithPaginationFetch = useCallback(
        async ({ page, sort }) => {
            if (!mappedDapps) return { page: [], hasMore: false }
            const filteredDapps = [...mappedDapps].sort(sortAppHubDapps(sort))
            const sliced = filteredDapps.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            return {
                page: sliced,
                hasMore: (page + 1) * PAGE_SIZE < filteredDapps.length,
            }
        },
        [mappedDapps],
    )

    const fetchWithPage: UseDappsWithPaginationFetch = useCallback(
        async args => {
            const [result, _] = await Promise.all([
                _fetchWithPage(args),
                new Promise(resolve => setTimeout(resolve, 500)),
            ])
            return result
        },
        [_fetchWithPage],
    )

    return {
        dependencyLoading: false,
        fetchWithPage,
    }
}
