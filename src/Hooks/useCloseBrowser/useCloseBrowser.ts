import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useCallback, useMemo } from "react"
import { RootStackParamListApps, RootStackParamListHome, RootStackParamListSettings, Routes } from "~Navigation"
import { selectLastNavigationSource, useAppSelector } from "~Storage/Redux"

type Args = Pick<RootStackParamListApps["Browser"], "returnScreen"> & {
    onNavigate: () => void | Promise<void>
}

/**
 * Get the function to close the browser with proper navigation
 * @param param0 Parameters
 * @returns Callback to close the browser
 */
export const useCloseBrowser = ({ returnScreen, onNavigate }: Args) => {
    const lastNavigationSource = useAppSelector(selectLastNavigationSource)

    const nav =
        useNavigation<
            NativeStackNavigationProp<RootStackParamListSettings & RootStackParamListHome & RootStackParamListApps>
        >()

    const _returnScreen = useMemo(() => {
        if (returnScreen) return returnScreen

        const validNavigationSources = [Routes.HOME, Routes.APPS, Routes.COLLECTIBLES_COLLECTION_DETAILS]
        if (lastNavigationSource && validNavigationSources.includes(lastNavigationSource as Routes)) {
            return lastNavigationSource as Routes.HOME | Routes.APPS | Routes.COLLECTIBLES_COLLECTION_DETAILS
        }
        return Routes.APPS
    }, [returnScreen, lastNavigationSource])

    return useCallback(async () => {
        await onNavigate()
        // Use goBack for routes that require params to avoid crashes
        if (_returnScreen === Routes.COLLECTIBLES_COLLECTION_DETAILS) {
            nav.goBack()
        } else {
            nav.navigate(_returnScreen as any)
        }
    }, [nav, onNavigate, _returnScreen])
}
