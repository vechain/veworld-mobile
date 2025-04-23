import { useMemo } from "react"
import { selectAllDapps, selectVisitedUrls, useAppSelector } from "~Storage/Redux"
import { HistoryUrlKind, mapHistoryUrls } from "~Utils/HistoryUtils"

export const useBrowserSearch = (query: string) => {
    const visitedUrls = useAppSelector(selectVisitedUrls)
    const apps = useAppSelector(selectAllDapps)
    const mappedUrls = useMemo(() => mapHistoryUrls(visitedUrls, apps), [apps, visitedUrls])

    const results = useMemo(() => {
        if (query.trim() === "") return mappedUrls
        const lowerQuery = query.toLowerCase()
        return mappedUrls.filter(url => {
            if (url.type === HistoryUrlKind.DAPP)
                return (
                    url.dapp.name.toLowerCase().includes(lowerQuery) ||
                    url.dapp.desc?.toLowerCase()?.includes(lowerQuery)
                )
            return url.name.toLowerCase().includes(lowerQuery) || url.url.includes(lowerQuery)
        })
    }, [mappedUrls, query])

    return { results }
}
