import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useMemo } from "react"
import { PlatformUtils } from "~Utils"

export enum BottomInsetsEXtraPadding {
    StaticButton = 80,
}

export const usePlatformBottomInsets = (
    extraPadding?: BottomInsetsEXtraPadding,
) => {
    const paddingBottom = useBottomTabBarHeight()

    const calculateBottomInsets: number = useMemo(() => {
        let staticButtonExtraPadding = extraPadding ?? 0

        return PlatformUtils.isIOS()
            ? paddingBottom + staticButtonExtraPadding
            : 0
    }, [paddingBottom, extraPadding])

    const tabBarAndroidBottomInsets: number = useMemo(() => {
        return PlatformUtils.isAndroid() ? paddingBottom : 0
    }, [paddingBottom])

    return { calculateBottomInsets, tabBarAndroidBottomInsets }
}
