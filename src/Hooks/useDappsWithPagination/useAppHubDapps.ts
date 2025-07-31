import { useCallback, useMemo } from "react"
import { DiscoveryDApp } from "~Constants"
import { DAppType, VeBetterDaoDapp } from "~Model"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { PAGE_SIZE } from "./constants"
import { UseDappsWithPaginationFetch, UseDappsWithPaginationSortKey } from "./types"
import { useVeBetterDaoActiveDapps } from "~Hooks/useFetchFeaturedDApps"
import { DappTypeV2 } from "~Screens/Flows/App/AppsScreen/Components/Ecosystem/types"

export const sortAppHubDapps = (sort: UseDappsWithPaginationSortKey) => (a: DiscoveryDApp, b: DiscoveryDApp) => {
    switch (sort) {
        case "alphabetic_asc":
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        case "alphabetic_desc":
            return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1
        case "newest":
            return new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
    }
}

const filterDappsV1 = (filter: DAppType, vbdDapps: VeBetterDaoDapp[] | undefined) => (dapp: DiscoveryDApp) => {
    switch (filter) {
        case DAppType.ALL:
            return true
        case DAppType.SUSTAINABILTY:
            return (
                dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase()) &&
                vbdDapps?.find(vbdDapp => vbdDapp.id.toLowerCase() === dapp.veBetterDaoId?.toLowerCase())
            )
        case DAppType.NFT:
            return dapp.tags?.includes(DAppType.NFT.toLowerCase())

        case DAppType.DAPPS:
            return (
                !dapp.tags?.includes(DAppType.NFT.toLowerCase()) &&
                !dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase())
            )
    }
}

const filterDappsV2 = (filter: DappTypeV2, _vbdDapps: VeBetterDaoDapp[] | undefined) => (_dapp: DiscoveryDApp) => {
    switch (filter) {
        case DappTypeV2.ALL:
            return true
        case DappTypeV2.DEFI:
            return true
        case DappTypeV2.NFTS:
            return true
        case DappTypeV2.GOVERNANCE:
            return true
        case DappTypeV2.TOOLS:
            return true
    }
}

export const useAppHubDapps = ({
    filter,
    kind,
}: { kind: "v1"; filter: DAppType } | { kind: "v2"; filter: DappTypeV2 }) => {
    const dapps = useAppSelector(selectFeaturedDapps)
    const { data: vbdActiveDapps } = useVeBetterDaoActiveDapps()

    const mappedDapps = useMemo(
        () =>
            dapps
                .map(dapp => ({
                    ...dapp,
                    tags: dapp.tags?.map(tag => tag.toLowerCase()),
                }))
                .filter(kind === "v1" ? filterDappsV1(filter, vbdActiveDapps) : filterDappsV2(filter, vbdActiveDapps)),
        [dapps, filter, kind, vbdActiveDapps],
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

    const fetchAll = useCallback(
        (sort: UseDappsWithPaginationSortKey) => {
            if (!mappedDapps) return []
            const filteredDapps = [...mappedDapps].sort(sortAppHubDapps(sort))
            return filteredDapps
        },
        [mappedDapps],
    )

    return {
        dependencyLoading: mappedDapps.length === 0,
        fetchWithPage,
        fetchAll,
    }
}
