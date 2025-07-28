import { useCallback, useMemo } from "react"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import {
    addBookmark,
    removeBookmark,
    selectAllDapps,
    selectBookmarkedDapps,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { URIUtils } from "~Utils"
import { URL } from "react-native-fast-url"

export const useDappBookmarking = (url?: string, title?: string) => {
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const bookmarkedDapps = useAppSelector(selectBookmarkedDapps)
    const allDApps = useAppSelector(selectAllDapps)

    const existingBookmark = useMemo(() => {
        if (!url) return undefined

        try {
            return bookmarkedDapps.find(bookmark =>
                URIUtils.compareURLs(new URL(bookmark.href.trim()).origin, new URL(url.trim()).origin),
            )
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
            dispatch(removeBookmark(existingBookmark))

            track(AnalyticsEvent.DISCOVERY_BOOKMARK_REMOVED, {
                dapp: url,
            })
        } else {
            const existingDApp = allDApps.find(dapp => {
                return URIUtils.compareURLs(URIUtils.getBaseURL(dapp.href), URIUtils.getBaseURL(url))
            })

            if (existingDApp) {
                return dispatch(addBookmark({ ...existingDApp, href: URIUtils.clean(url) }))
            } else {
                const _url = new URL(url)

                const bookmark: DiscoveryDApp = {
                    name: title ?? _url.host,
                    href: URIUtils.clean(_url.href),
                    desc: "",
                    isCustom: true,
                    createAt: new Date().getTime(),
                    amountOfNavigations: 1,
                }

                dispatch(addBookmark(bookmark))
            }

            track(AnalyticsEvent.DISCOVERY_BOOKMARK_ADDED, {
                dapp: URIUtils.clean(url),
            })
        }
    }, [url, existingBookmark, dispatch, track, allDApps, title])

    return {
        toggleBookmark,
        existingBookmark,
        isBookMarked,
    }
}
