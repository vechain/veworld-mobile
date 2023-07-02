import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useMemo } from "react"
import { PlatformUtils } from "~Utils"

export enum BottomInsetsEXtraPadding {
    StaticButton = 80,
}

export const usePlatformBottomInsets = (
    extraPadding?: BottomInsetsEXtraPadding,
) => {
    const _paddingBottom = useBottomTabBarHeight()

    const calculateBottomInsets: number = useMemo(() => {
        let staticButtonExtraPadding = extraPadding ? extraPadding : 0

        return PlatformUtils.isIOS()
            ? _paddingBottom + staticButtonExtraPadding
            : 0
    }, [_paddingBottom, extraPadding])

    return { calculateBottomInsets }
}
