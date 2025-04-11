import { useCallback, useMemo } from "react"
import { useVeBetterDaoDapps } from "./useVeBetterDaoDapps"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { queryClient } from "~Api/QueryProvider"
import { getVeBetterDaoDAppMetadata } from "~Networking"
import { DiscoveryDApp } from "~Constants"
import { useInfiniteQuery } from "@tanstack/react-query"

export type VeBetterDaoDappsSortKey = "alphabetic_asc" | "alphabetic_desc" | "newest"

type Args = {
    sort?: VeBetterDaoDappsSortKey
    enabled: boolean
}

const PAGE_SIZE = 10

const sortVBDDapps = (sort: VeBetterDaoDappsSortKey) => (a: VeBetterDaoDapp, b: VeBetterDaoDapp) => {
    switch (sort) {
        case "alphabetic_asc":
            return a.name > b.name ? 1 : -1
        case "alphabetic_desc":
            return a.name > b.name ? -1 : 1
        case "newest":
            return new Date(b.createdAtTimestamp).getTime() - new Date(a.createdAtTimestamp).getTime()
    }
}

const fetchVBDMetadata = (dapp: VeBetterDaoDapp) => {
    return queryClient.fetchQuery({
        queryKey: ["DAPP_METADATA", dapp.metadataURI],
        queryFn: () => getVeBetterDaoDAppMetadata(`ipfs://${dapp.metadataURI}`),
    })
}

const mapVBDDappToDiscoveryDapp = (dapp: VeBetterDaoDapp & VeBetterDaoDAppMetadata): DiscoveryDApp => {
    return {
        name: dapp.name,
        href: new URL(dapp.external_url).href,
        desc: dapp.description,
        createAt: new Date(dapp.createdAtTimestamp).getTime(),
        isCustom: false,
        amountOfNavigations: 0,
        isVeWorldSupported: true,
        veBetterDaoId: dapp.id,
    }
}

export const useVeBetterDaoDappsWithMetadata = ({ sort = "alphabetic_asc", enabled }: Args) => {
    const { data, isFetching: isFetchingVBD } = useVeBetterDaoDapps(enabled)

    const fetchWithPage = useCallback(
        async (page = 0) => {
            if (!data) return { page: [], hasMore: false }
            const sliced = [...data].sort(sortVBDDapps(sort)).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            const metadata = await Promise.all(sliced.map(fetchVBDMetadata))
            const returnPage = sliced.map((vbdDapp, idx) => mapVBDDappToDiscoveryDapp({ ...vbdDapp, ...metadata[idx] }))
            return {
                page: returnPage,
                hasMore: page + 1 * PAGE_SIZE < data.length,
            }
        },
        [data, sort],
    )

    const {
        data: pages,
        isFetching,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["VBD_WITH_METADATA", sort],
        queryFn: ({ pageParam }) => fetchWithPage(pageParam),
        getNextPageParam: (_lastPage, _allPages, _lastPageParam) => (_lastPage.hasMore ? _lastPageParam + 1 : null),
        initialPageParam: 0,
        enabled: !!data,
    })

    const isLoading = useMemo(() => isFetching || isFetchingVBD, [isFetching, isFetchingVBD])

    const flattedData = useMemo(() => pages?.pages?.flatMap(({ page }) => page), [pages?.pages])

    return {
        isLoading,
        data: flattedData,
        fetchNextPage,
    }
}
