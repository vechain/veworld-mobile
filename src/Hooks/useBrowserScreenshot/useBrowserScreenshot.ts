import { useCallback, useMemo, useRef } from "react"
import { View } from "react-native"
import { captureRef, releaseCapture } from "react-native-view-shot"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { DiscoveryDApp } from "~Constants"
import { useAppSelector, useAppDispatch, updateTab, selectCurrentTabId, updateLastVisitedUrl } from "~Storage/Redux"
import { URIUtils } from "~Utils"

export const useBrowserScreenshot = () => {
    const webviewContainerRef = useRef<View>(null)
    const selectedTabId = useAppSelector(selectCurrentTabId)
    const dispatch = useAppDispatch()
    const { isDapp, navigationState, dappMetadata } = useInAppBrowser()

    const performScreenshot = useCallback(async () => {
        if (!webviewContainerRef.current || !selectedTabId) return
        try {
            const uri = await captureRef(webviewContainerRef, {
                format: "jpg",
                quality: 0.9,
                fileName: `${selectedTabId}-preview-${Date.now()}`,
                result: "data-uri",
            })

            const favicon = navigationState?.url
                ? `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(navigationState?.url).origin}`
                : ""

            dispatch(
                updateTab({
                    id: selectedTabId,
                    preview: uri,
                    ...(!isDapp && { title: navigationState?.title, favicon }),
                    favicon: dappMetadata?.icon ?? favicon,
                }),
            )

            // update the last visited url
            const _url = new URL(navigationState?.url ?? "")
            const href = _url.search.length === 0 ? URIUtils.clean(_url.href) : navigationState?.url ?? ""

            const visitedUrl: DiscoveryDApp = {
                name: navigationState?.title ?? _url.host,
                href: href,
                desc: "",
                isCustom: true,
                createAt: new Date().getTime(),
                amountOfNavigations: 1,
            }

            dispatch(updateLastVisitedUrl(visitedUrl))
            releaseCapture(uri)
        } catch {}
    }, [dispatch, isDapp, navigationState?.title, navigationState?.url, selectedTabId, dappMetadata?.icon])

    const memoized = useMemo(() => ({ performScreenshot, ref: webviewContainerRef }), [performScreenshot])

    return memoized
}
