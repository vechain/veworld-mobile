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
import { VbdDApp } from "~Model"
import { DAppReference } from "~Storage/Redux/Slices"

/**
 * Check if an App Hub dApp is bookmarked by ID
 */
const checkAppHubBookmark = (
    trimmedUrl: string,
    favoriteRefs: DAppReference[] | undefined,
    featuredDapps: DiscoveryDApp[],
    bookmarkedDapps: DiscoveryDApp[],
): DiscoveryDApp | undefined => {
    const featuredMatch = featuredDapps.find(dapp => URIUtils.getBaseURL(dapp.href) === trimmedUrl)

    if (!featuredMatch) return undefined

    const isBookmarkedById = favoriteRefs?.some(ref => {
        if (ref.type === "app-hub" && featuredMatch.id) {
            return ref.id === featuredMatch.id
        }
        if (ref.type === "vbd" && featuredMatch.veBetterDaoId) {
            return ref.vbdId === featuredMatch.veBetterDaoId
        }
        return false
    })

    if (!isBookmarkedById) return undefined

    // Try to find in bookmarkedDapps
    const found = bookmarkedDapps.find(bookmark => {
        if (featuredMatch.id) return bookmark.id === featuredMatch.id
        if (featuredMatch.veBetterDaoId) return bookmark.veBetterDaoId === featuredMatch.veBetterDaoId
        return false
    })
    if (found) return found

    // If favoriteRefs says it's bookmarked but not resolved yet, return the featured dApp
    return featuredMatch
}

/**
 * Check if a VBD dApp is bookmarked by vbdId
 */
const checkVbdBookmark = (
    trimmedUrl: string,
    favoriteRefs: DAppReference[] | undefined,
    vbdApps: VbdDApp[] | undefined,
    bookmarkedDapps: DiscoveryDApp[],
): DiscoveryDApp | undefined => {
    const vbdMatch = vbdApps?.find(dapp => URIUtils.getBaseURL(dapp.external_url) === trimmedUrl)

    if (!vbdMatch) return undefined

    const isBookmarkedByVbdId = favoriteRefs?.some(ref => ref.type === "vbd" && ref.vbdId === vbdMatch.id)

    if (!isBookmarkedByVbdId) return undefined

    // Try to find in bookmarkedDapps
    const found = bookmarkedDapps.find(bookmark => bookmark.veBetterDaoId === vbdMatch.id)
    if (found) return found

    // If favoriteRefs says it's bookmarked but not resolved yet, return minimal object
    return {
        href: vbdMatch.external_url,
        name: vbdMatch.name,
        desc: vbdMatch.description,
        isCustom: false,
        createAt: Date.parse(vbdMatch.createdAtTimestamp),
        amountOfNavigations: 0,
        veBetterDaoId: vbdMatch.id,
    } as DiscoveryDApp
}

/**
 * Check if a custom URL is bookmarked
 */
const checkCustomBookmark = (
    trimmedUrl: string,
    favoriteRefs: DAppReference[] | undefined,
    bookmarkedDapps: DiscoveryDApp[],
    url: string,
    title?: string,
): DiscoveryDApp | undefined => {
    const customRefExists = favoriteRefs?.some(
        ref => ref.type === "custom" && URIUtils.compareURLs(ref.url, trimmedUrl),
    )

    if (!customRefExists) return undefined

    // Try to find in resolved bookmarkedDapps first
    const found = bookmarkedDapps.find(
        bookmark => bookmark.isCustom && URIUtils.getBaseURL(bookmark.href) === trimmedUrl,
    )
    if (found) return found

    // If favoriteRefs says it's bookmarked but not resolved yet, return a minimal custom object
    return {
        href: trimmedUrl,
        name: title || new URL(url).hostname,
        desc: "",
        isCustom: true,
        createAt: Date.now(),
        amountOfNavigations: 0,
    } as DiscoveryDApp
}

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
        if (!trimmed) return undefined

        try {
            // Check App Hub and featured VBD dApps
            const appHubBookmark = checkAppHubBookmark(trimmed, favoriteRefs, featuredDapps, bookmarkedDapps)
            if (appHubBookmark) return appHubBookmark

            // Check VBD dApps
            const vbdBookmark = checkVbdBookmark(trimmed, favoriteRefs, vbdApps, bookmarkedDapps)
            if (vbdBookmark) return vbdBookmark

            // Check custom URL bookmarks
            const customBookmark = checkCustomBookmark(trimmed, favoriteRefs, bookmarkedDapps, url, title)
            if (customBookmark) return customBookmark

            return undefined
        } catch {
            return undefined
        }
    }, [bookmarkedDapps, favoriteRefs, featuredDapps, vbdApps, url, title])

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
