import { uniqBy } from "lodash"
import { useMemo } from "react"
import { selectAllDapps, selectVisitedUrls, useAppSelector } from "~Storage/Redux"
import { HistoryDappItem, HistoryItem, HistoryUrlKind, mapHistoryUrls } from "~Utils/HistoryUtils"

const sortHistoryItem = (a: HistoryItem, b: HistoryItem) => {
    const aValue = a.type === HistoryUrlKind.DAPP ? a.dapp.name.toLowerCase() : a.name.toLowerCase()
    const bValue = b.type === HistoryUrlKind.DAPP ? b.dapp.name.toLowerCase() : b.name.toLowerCase()
    return aValue.localeCompare(bValue)
}

const isExactMatch = (url: HistoryItem, query: string) => {
    if (url.type === HistoryUrlKind.DAPP) {
        const _url = new URL(url.dapp.href)
        return _url.host.toLowerCase() === query
    }
    const _url = new URL(url.url)
    return _url.host.toLowerCase() === query
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
        if (!isValidQuery) return { found: mappedUrls, others: [] }
        const lowerQuery = query.toLowerCase()
        const urls = mappedUrls.filter(url => url.type === HistoryUrlKind.URL)
        const allDapps = uniqBy(
            mappedUrls.filter(url => url.type === HistoryUrlKind.DAPP).concat(mappedApps),
            "dapp.href",
        )
        const _results = [...urls, ...allDapps]
            .filter(url => {
                if (url.type === HistoryUrlKind.DAPP)
                    return (
                        url.dapp.name.toLowerCase().includes(lowerQuery) ||
                        url.dapp.href.toLowerCase().includes(lowerQuery)
                    )
                return url.name.toLowerCase().includes(lowerQuery) || url.url.toLowerCase().includes(lowerQuery)
            })
            .sort(sortHistoryItem)

        // check if there is an exact match
        const someExactMatch = _results.some(url => {
            if (url.type === HistoryUrlKind.DAPP) {
                const _url = new URL(url.dapp.href)
                return _url.host.toLowerCase() === lowerQuery
            }
            const _url = new URL(url.url)
            return _url.host.toLowerCase() === lowerQuery
        })

        // reduce the results into found and others
        return _results.reduce(
            (acc, url) => {
                if (!someExactMatch) {
                    acc.found.push(url)
                    return acc
                }
                if (isExactMatch(url, lowerQuery)) {
                    acc.found.push(url)
                } else {
                    acc.others.push(url)
                }
                return acc
            },
            { found: [], others: [] } as { found: HistoryItem[]; others: HistoryItem[] },
        )
    }, [isValidQuery, mappedApps, mappedUrls, query])

    return { results, isValidQuery }
}
