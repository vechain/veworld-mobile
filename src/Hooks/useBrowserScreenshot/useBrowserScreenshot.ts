import { useCallback, useMemo, useRef, useState } from "react"
import { View } from "react-native"
import { captureRef, releaseCapture } from "react-native-view-shot"
import * as FileSystem from "expo-file-system"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { DiscoveryDApp, ERROR_EVENTS } from "~Constants"
import { useAppSelector, useAppDispatch, updateTab, selectCurrentTabId, updateLastVisitedUrl } from "~Storage/Redux"
import { ErrorMessageUtils, debug, URIUtils } from "~Utils"

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
            tempUri = await captureRef(webviewContainerRef, {
                format: "jpg",
                quality: 0.4, // Compression for small previews
                result: "tmpfile",
                height: 400, // Capture at lower resolution for display height of tab in tab manager screen
            })

            // Store temp URI for async processing
            const capturedTempUri = tempUri

            // Process screenshot asynchronously (non-blocking)
            setTimeout(async () => {
                try {
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

                    // The following dispatches affect the Discovery state but they will be batched together
                    // when saved to redux state

                    // Update tab with screenshot path
                    dispatch(
                        updateTab({
                            id: selectedTabId,
                            previewPath: `screenshots/${fileName}`,
                            ...(!isDapp && { title: navigationState?.title, favicon }),
                            favicon: dappMetadata?.icon ?? favicon,
                        }),
                    )

                    // Update last visited URL
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
                } catch (error) {
                    debug(ERROR_EVENTS.APP, ErrorMessageUtils.getErrorMessage(error))
                } finally {
                    // Clean up temp file
                    if (capturedTempUri) {
                        releaseCapture(capturedTempUri)
                    }
                    setPerformingScreenshot(false)
                }
            }, 0) // Process on next tick
        } catch (error) {
            debug(ERROR_EVENTS.APP, ErrorMessageUtils.getErrorMessage(error))
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
