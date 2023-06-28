import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useMemo } from "react"
import { PlatformUtils } from "~Utils"

export const usePlatformBottomInsets = (hasStaticButton?: string) => {
    const _paddingBottom = useBottomTabBarHeight()

    const calculateBottomInsets: number = useMemo(() => {
        let staticButtonExtraPadding = hasStaticButton ? 80 : 0

        return PlatformUtils.isIOS()
            ? _paddingBottom + staticButtonExtraPadding
            : 0
    }, [_paddingBottom, hasStaticButton])

    return { calculateBottomInsets }
}
