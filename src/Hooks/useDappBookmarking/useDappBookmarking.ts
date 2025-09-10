import { useCallback, useMemo } from "react"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useVeBetterDaoDapps } from "~Hooks"
import {
    addBookmark,
    removeBookmark,
    selectBookmarkedDapps,
    selectFeaturedDapps,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { URIUtils } from "~Utils"

export const useDappBookmarking = (url?: string, title?: string) => {
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const bookmarkedDapps = useAppSelector(selectBookmarkedDapps)
    const featuredDapps = useAppSelector(selectFeaturedDapps)
    const { data: vbdApps } = useVeBetterDaoDapps()

    const existingBookmark = useMemo(() => {
        if (!url) return undefined
        const trimmed = URIUtils.getBaseURL(url)
        try {
            return bookmarkedDapps.find(bookmark => URIUtils.getBaseURL(bookmark.href) === trimmed)
        } catch {
            return undefined
        }
    }, [bookmarkedDapps, url])

    const isBookMarked = useMemo(() => {
        return !!existingBookmark
    }, [existingBookmark])

    const toggleBookmark = useCallback(async () => {
        if (!url) return

        if (existingBookmark) {
            dispatch(
                removeBookmark({
                    href: existingBookmark.href ?? "",
                    isCustom: existingBookmark.isCustom,
                }),
            )

            track(AnalyticsEvent.DISCOVERY_BOOKMARK_REMOVED, {
                dapp: url,
            })

            return
        }

        const baseURL = URIUtils.getBaseURL(url)
        try {
            const existingDApp = featuredDapps.find(dapp => {
                return URIUtils.getBaseURL(dapp.href) === baseURL
            })
            if (existingDApp) return dispatch(addBookmark(existingDApp))
            const existingVbdApp = vbdApps?.find(dapp => {
                return URIUtils.getBaseURL(dapp.external_url) === baseURL
            })
            if (existingVbdApp) return dispatch(addBookmark(existingVbdApp))
            const _url = new URL(url)

            const bookmark: DiscoveryDApp = {
                name: title ?? _url.host,
                href: baseURL!,
                desc: "",
                isCustom: true,
                createAt: new Date().getTime(),
                amountOfNavigations: 1,
            }

            dispatch(addBookmark(bookmark))
        } finally {
            track(AnalyticsEvent.DISCOVERY_BOOKMARK_ADDED, {
                dapp: baseURL,
            })
        }
    }, [url, existingBookmark, dispatch, track, featuredDapps, vbdApps, title])

    return {
        toggleBookmark,
        existingBookmark,
        isBookMarked,
    }
}
