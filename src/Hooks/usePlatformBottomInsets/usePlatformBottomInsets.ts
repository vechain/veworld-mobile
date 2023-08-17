import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useMemo } from "react"
import { PlatformUtils } from "~Utils"

export enum BottomInsetsEXtraPadding {
    StaticButton = 80,
    TabBar = 24,
}

export const usePlatformBottomInsets = (
    extraPadding?: BottomInsetsEXtraPadding,
) => {
    const paddingBottom = useBottomTabBarHeight()
    let staticExtraPadding = extraPadding ?? 0

    const iosSpecificBottomInsetsIfIos: number = useMemo(() => {
        return PlatformUtils.isIOS() ? paddingBottom + staticExtraPadding : 0
    }, [paddingBottom, staticExtraPadding])

    const androidSpecificBottomInsetsIfAndroid: number = useMemo(() => {
        return PlatformUtils.isAndroid()
            ? paddingBottom + staticExtraPadding
            : staticExtraPadding
    }, [paddingBottom, staticExtraPadding])

    const platformBottomInsets: number = useMemo(() => {
        return paddingBottom + staticExtraPadding
    }, [paddingBottom, staticExtraPadding])

    return {
        iosSpecificBottomInsetsIfIos,
        androidSpecificBottomInsetsIfAndroid,
        platformBottomInsets,
    }
}
