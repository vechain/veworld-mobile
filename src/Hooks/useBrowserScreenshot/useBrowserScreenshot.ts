import { useCallback, useMemo, useRef } from "react"
import { View } from "react-native"
import { captureRef, releaseCapture } from "react-native-view-shot"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useAppSelector, useAppDispatch, updateTab, selectCurrentTabId } from "~Storage/Redux"

export const useBrowserScreenshot = () => {
    const webviewContainerRef = useRef<View>(null)
    const selectedTabId = useAppSelector(selectCurrentTabId)
    const dispatch = useAppDispatch()
    const { isDapp, navigationState } = useInAppBrowser()

    const performScreenshot = useCallback(async () => {
        if (!webviewContainerRef.current || !selectedTabId) return
        try {
            const uri = await captureRef(webviewContainerRef, {
                format: "jpg",
                quality: 0.9,
                fileName: `${selectedTabId}-preview-${Date.now()}`,
                result: "data-uri",
            })
            dispatch(updateTab({ id: selectedTabId, preview: uri, ...(!isDapp && { title: navigationState?.title }) }))
            releaseCapture(uri)
        } catch {}
    }, [dispatch, isDapp, navigationState?.title, selectedTabId])

    const memoized = useMemo(() => ({ performScreenshot, ref: webviewContainerRef }), [performScreenshot])

    return memoized
}
