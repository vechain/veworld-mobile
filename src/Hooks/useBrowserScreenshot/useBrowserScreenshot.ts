import { useCallback, useMemo, useRef, useState } from "react"
import { View } from "react-native"
import { captureRef, releaseCapture } from "react-native-view-shot"
import * as FileSystem from "expo-file-system"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { DiscoveryDApp } from "~Constants"
import { useAppSelector, useAppDispatch, updateTab, selectCurrentTabId, updateLastVisitedUrl } from "~Storage/Redux"
import { URIUtils } from "~Utils"

export const useBrowserScreenshot = () => {
    const webviewContainerRef = useRef<View>(null)
    const [performingScreenshot, setPerformingScreenshot] = useState(false)
    const selectedTabId = useAppSelector(selectCurrentTabId)
    const dispatch = useAppDispatch()
    const { isDapp, navigationState, dappMetadata } = useInAppBrowser()

    const performScreenshot = useCallback(async () => {
        if (performingScreenshot) return
        setPerformingScreenshot(true)

        if (!webviewContainerRef.current || !selectedTabId) {
            setPerformingScreenshot(false)
            return
        }

        // Capture screenshot immediately (blocking part)
        let tempUri: string | null = null
        try {
            const startTimeCaptureRef = performance.now()
            tempUri = await captureRef(webviewContainerRef, {
                format: "jpg",
                quality: 0.4, // Aggressive compression for small previews
                result: "tmpfile", // Save to temp file instead of base64
                height: 400, // Capture at lower resolution for 194px display height in tab manager screen
            })
            const endTimeCaptureRef = performance.now()
            console.log(`captureRef duration: ${endTimeCaptureRef - startTimeCaptureRef}ms`)

            // Store temp URI for async processing
            const capturedTempUri = tempUri

            // Process screenshot asynchronously (non-blocking)
            setTimeout(async () => {
                try {
                    const startTimeAsync = performance.now()

                    // Ensure screenshots directory exists
                    const screenshotsDir = `${FileSystem.documentDirectory}screenshots/`
                    const dirInfo = await FileSystem.getInfoAsync(screenshotsDir)
                    if (!dirInfo.exists) {
                        await FileSystem.makeDirectoryAsync(screenshotsDir, { intermediates: true })
                    }

                    // Define persistent file path
                    const fileName = `${selectedTabId}-preview.jpg`
                    const persistentPath = `${screenshotsDir}${fileName}`

                    // Delete old screenshot if exists
                    const oldFileInfo = await FileSystem.getInfoAsync(persistentPath)
                    if (oldFileInfo.exists) {
                        await FileSystem.deleteAsync(persistentPath, { idempotent: true })
                    }

                    // Copy temp file to persistent location
                    await FileSystem.copyAsync({
                        from: capturedTempUri,
                        to: persistentPath,
                    })

                    const favicon = navigationState?.url
                        ? `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(navigationState?.url).origin}`
                        : ""

                    // Batch Redux updates together
                    const startTimeRedux = performance.now()

                    // Update tab with screenshot path
                    dispatch(
                        updateTab({
                            id: selectedTabId,
                            previewPath: persistentPath, // Store file path instead of base64
                            ...(!isDapp && { title: navigationState?.title, favicon }),
                            favicon: dappMetadata?.icon ?? favicon,
                        }),
                    )

                    // Update last visited URL (defer this to reduce immediate load)

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

                    const endTimeRedux = performance.now()
                    console.log(`Redux updates duration: ${endTimeRedux - startTimeRedux}ms`)

                    const endTimeAsync = performance.now()
                    console.log(`Async processing duration: ${endTimeAsync - startTimeAsync}ms`)
                } catch (error) {
                    console.error("Screenshot processing failed:", error)
                } finally {
                    // Clean up temp file
                    if (capturedTempUri) {
                        releaseCapture(capturedTempUri)
                    }
                    setPerformingScreenshot(false)
                }
            }, 0) // Process on next tick
        } catch (error) {
            console.error("Screenshot capture failed:", error)
            setPerformingScreenshot(false)
            if (tempUri) {
                releaseCapture(tempUri)
            }
        }
    }, [
        dispatch,
        isDapp,
        navigationState?.title,
        navigationState?.url,
        selectedTabId,
        dappMetadata?.icon,
        performingScreenshot,
    ])

    const memoized = useMemo(() => ({ performScreenshot, ref: webviewContainerRef }), [performScreenshot])

    return memoized
}
