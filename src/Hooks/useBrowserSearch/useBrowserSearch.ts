import { uniqBy } from "lodash"
import { useMemo } from "react"
import { selectAllDapps, selectVisitedUrls, useAppSelector } from "~Storage/Redux"
import { HistoryDappItem, HistoryItem, HistoryUrlKind, mapHistoryUrls } from "~Utils/HistoryUtils"

const sortHistoryItem = (a: HistoryItem, b: HistoryItem) => {
    const aValue = a.type === HistoryUrlKind.DAPP ? a.dapp.name.toLowerCase() : a.name.toLowerCase()
    const bValue = b.type === HistoryUrlKind.DAPP ? b.dapp.name.toLowerCase() : b.name.toLowerCase()
    return aValue.localeCompare(bValue)
}

export const useBrowserSearch = (query: string) => {
    const visitedUrls = useAppSelector(selectVisitedUrls)
    const apps = useAppSelector(selectAllDapps)
    const mappedUrls = useMemo(() => mapHistoryUrls(visitedUrls, apps), [apps, visitedUrls])

    const isValidQuery = useMemo(() => query.trim().length >= 2, [query])

    const mappedApps = useMemo<HistoryDappItem[]>(
        () => apps.map(app => ({ type: HistoryUrlKind.DAPP, dapp: app })),
        [apps],
    )

    const results = useMemo(() => {
        if (!isValidQuery) return mappedUrls
        const lowerQuery = query.toLowerCase()
        const urls = mappedUrls.filter(url => url.type === HistoryUrlKind.URL)
        const allDapps = uniqBy(
            mappedUrls.filter(url => url.type === HistoryUrlKind.DAPP).concat(mappedApps),
            "dapp.href",
        )
        return [...urls, ...allDapps]
            .filter(url => {
                if (url.type === HistoryUrlKind.DAPP) return url.dapp.name.toLowerCase().includes(lowerQuery)
                return url.name.toLowerCase().includes(lowerQuery)
            })
            .sort(sortHistoryItem)
    }, [isValidQuery, mappedApps, mappedUrls, query])

    return { results, isValidQuery }
}
