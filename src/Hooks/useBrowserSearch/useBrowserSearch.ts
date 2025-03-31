import { useNavigation } from "@react-navigation/native"
import { URIUtils } from "~Utils"
import { Routes } from "~Navigation"
import { useVisitedUrls } from "./useVisitedUrls"
import { useCallback, useMemo } from "react"
import { useAppSelector, selectVisitedUrls, selectAllDapps } from "~Storage/Redux"
import { HistoryUrlKind, mapHistoryUrls } from "~Utils/HistoryUtils"

export enum SearchError {
    ADDRESS_CANNOT_BE_REACHED,
}

export const useBrowserSearch = (query: string) => {
    const nav = useNavigation()
    const { addVisitedUrl } = useVisitedUrls()
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

    const navigateToBrowser = useCallback(
        async (value: string) => {
            const valueLower = value.toLowerCase()
            const isValid = await URIUtils.isValidBrowserUrl(valueLower)
            if (isValid) {
                const url = valueLower.startsWith("https://") ? valueLower : `https://${valueLower}`
                nav.navigate(Routes.BROWSER, { url })
                addVisitedUrl(url)
                return
            }

            return SearchError.ADDRESS_CANNOT_BE_REACHED
        },
        [nav, addVisitedUrl],
    )

    return { navigateToBrowser, results }
}
