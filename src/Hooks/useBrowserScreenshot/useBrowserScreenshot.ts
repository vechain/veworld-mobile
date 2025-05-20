import { useCallback, useMemo, useRef } from "react"
import { View } from "react-native"
import { captureRef, releaseCapture } from "react-native-view-shot"
import { useAppSelector, selectCurrentTab, useAppDispatch, updateTab } from "~Storage/Redux"

export const useBrowserScreenshot = () => {
    const webviewContainerRef = useRef<View>(null)
    const selectedTab = useAppSelector(selectCurrentTab)
    const dispatch = useAppDispatch()

    const performScreenshot = useCallback(async () => {
        if (!webviewContainerRef.current || !selectedTab) return
        try {
            const uri = await captureRef(webviewContainerRef, {
                format: "jpg",
                quality: 0.9,
                fileName: `${selectedTab.id}-preview-${Date.now()}`,
                result: "data-uri",
            })
            dispatch(updateTab({ ...selectedTab, preview: uri }))
            releaseCapture(uri)
        } catch {}
    }, [dispatch, selectedTab])

    const memoized = useMemo(() => ({ performScreenshot, ref: webviewContainerRef }), [performScreenshot])

    return memoized
}
