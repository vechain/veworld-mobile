import { useCallback, useMemo } from "react"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import {
    addBookmark,
    removeBookmark,
    selectAllDapps,
    selectBookmarkedDapps,
    updateBookmark,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { HTMLUtils, URIUtils } from "~Utils"

const getOpenGraphDescription = async (url: string) => {
    let description = ""
    try {
        const html = await HTMLUtils.getHtmlFromUrl(url)
        description = HTMLUtils.getOpenGraphDescriptionFromHtmlDocument(html, url)
    } catch (error) {
        description = url
    }

    return description
}

export const useDappBookmarking = (url?: string, title?: string) => {
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const bookmarkedDapps: DiscoveryDApp[] = useAppSelector(selectBookmarkedDapps)
    const allDApps = useAppSelector(selectAllDapps)

    const existingBookmark = useMemo(() => {
        if (!url) return undefined

        try {
            return bookmarkedDapps.find(bookmark =>
                URIUtils.compareURLs(URIUtils.clean(bookmark.href), URIUtils.clean(url)),
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
            const existingDApp = allDApps.find(dapp =>
                URIUtils.compareURLs(URIUtils.clean(dapp.href), URIUtils.clean(url)),
            )

            if (existingDApp) {
                return dispatch(addBookmark(existingDApp))
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

                getOpenGraphDescription(url).then(desc => {
                    dispatch(updateBookmark({ ...bookmark, desc }))
                })
            }

            track(AnalyticsEvent.DISCOVERY_BOOKMARK_ADDED, {
                dapp: URIUtils.clean(url),
            })
        }
    }, [track, dispatch, existingBookmark, url, title, allDApps])

    return {
        toggleBookmark,
        existingBookmark,
        isBookMarked,
    }
}
