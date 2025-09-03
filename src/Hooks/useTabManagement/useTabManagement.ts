import { useCallback } from "react"
import * as FileSystem from "expo-file-system"
import {
    closeTab as closeTabAction,
    closeAllTabs as closeAllTabsAction,
    selectTabs,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

const deleteTabScreenshot = async (tabId: string) => {
    try {
        const screenshotsDir = `${FileSystem.documentDirectory}screenshots/`
        const screenshotPath = `${screenshotsDir}${tabId}-preview.jpg`

        const fileInfo = await FileSystem.getInfoAsync(screenshotPath)
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(screenshotPath, { idempotent: true })
            console.log(`Deleted screenshot for tab ${tabId}`)
        }
    } catch (error) {
        console.error(`Failed to delete screenshot for tab ${tabId}:`, error)
    }
}

const deleteAllScreenshots = async () => {
    try {
        const screenshotsDir = `${FileSystem.documentDirectory}screenshots/`
        const dirInfo = await FileSystem.getInfoAsync(screenshotsDir)

        if (dirInfo.exists) {
            // Delete the entire screenshots directory and recreate it empty
            await FileSystem.deleteAsync(screenshotsDir, { idempotent: true })
            await FileSystem.makeDirectoryAsync(screenshotsDir, { intermediates: true })
            console.log("Deleted all screenshots")
        }
    } catch (error) {
        console.error("Failed to delete all screenshots:", error)
    }
}

export const useTabManagement = () => {
    const dispatch = useAppDispatch()
    const tabs = useAppSelector(selectTabs)

    const closeTab = useCallback(
        async (tabId: string) => {
            // Delete the screenshot file first
            await deleteTabScreenshot(tabId)
            // Then dispatch the Redux action
            dispatch(closeTabAction(tabId))
        },
        [dispatch],
    )

    const closeAllTabs = useCallback(async () => {
        // Delete all screenshots first
        await deleteAllScreenshots()
        // Then dispatch the Redux action
        dispatch(closeAllTabsAction())
    }, [dispatch])

    return {
        tabs,
        closeTab,
        closeAllTabs,
    }
}
