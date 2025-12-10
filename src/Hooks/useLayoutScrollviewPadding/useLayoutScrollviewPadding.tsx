import { useMemo } from "react"
import { useTabBarBottomMargin } from "~Hooks/useTabBarBottomMargin"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

export const useLayoutScrollviewPadding = () => {
    const { iosOnlyTabBarBottomMargin, androidOnlyTabBarBottomMargin } = useTabBarBottomMargin()

    // // Empirical data: This is necessary for older devices with the bottom tab bar height issues
    const ANDROID_ADDITIONAL_PADDING = 72

    const containerPaddingBottom = useMemo(
        () => (isAndroid() ? androidOnlyTabBarBottomMargin : iosOnlyTabBarBottomMargin),
        [androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin],
    )

    const contentExtraBottomPadding = useMemo(() => (isAndroid() ? ANDROID_ADDITIONAL_PADDING : 0), [])

    return useMemo(
        () => containerPaddingBottom + contentExtraBottomPadding,
        [containerPaddingBottom, contentExtraBottomPadding],
    )
}
