import { useCallback, useMemo } from "react"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useDappBookmarksList, useVeBetterDaoDapps } from "~Hooks"
import {
    addBookmark,
    removeBookmark,
    selectFavoriteRefs,
    selectFeaturedDapps,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { URIUtils } from "~Utils"

export const useDappBookmarkToggle = (url?: string, title?: string) => {
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const bookmarkedDapps = useDappBookmarksList()
    const favoriteRefs = useAppSelector(selectFavoriteRefs)
    const featuredDapps = useAppSelector(selectFeaturedDapps)
    const { data: vbdApps } = useVeBetterDaoDapps()

    const existingBookmark = useMemo(() => {
        if (!url) return undefined
        const trimmed = URIUtils.getBaseURL(url)
        try {
            const featuredMatch = featuredDapps.find(dapp => URIUtils.getBaseURL(dapp.href) === trimmed)

            if (featuredMatch) {
                const isBookmarkedById = favoriteRefs?.some(ref => {
                    if (ref.type === "app-hub" && featuredMatch.id) {
                        return ref.id === featuredMatch.id
                    }
                    if (ref.type === "vbd" && featuredMatch.veBetterDaoId) {
                        return ref.vbdId === featuredMatch.veBetterDaoId
                    }
                    return false
                })

                if (isBookmarkedById) {
                    return bookmarkedDapps.find(bookmark => {
                        if (featuredMatch.id) return bookmark.id === featuredMatch.id
                        if (featuredMatch.veBetterDaoId) return bookmark.veBetterDaoId === featuredMatch.veBetterDaoId
                        return false
                    })
                }
            }

            const vbdMatch = vbdApps?.find(dapp => URIUtils.getBaseURL(dapp.external_url) === trimmed)
            if (vbdMatch) {
                const isBookmarkedByVbdId = favoriteRefs?.some(ref => ref.type === "vbd" && ref.vbdId === vbdMatch.id)
                if (isBookmarkedByVbdId) {
                    return bookmarkedDapps.find(bookmark => bookmark.veBetterDaoId === vbdMatch.id)
                }
            }

            return bookmarkedDapps.find(bookmark => bookmark.isCustom && URIUtils.getBaseURL(bookmark.href) === trimmed)
        } catch {
            return undefined
        }
    }, [bookmarkedDapps, favoriteRefs, featuredDapps, vbdApps, url])

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
