import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useMemo } from "react"
import { PlatformUtils } from "~Utils"

export const usePlatformBottomInsets = () => {
    const _paddingBottom = useBottomTabBarHeight()

    const calculateBottomInsets: number = useMemo(
        () => (PlatformUtils.isIOS() ? _paddingBottom : 0),
        [_paddingBottom],
    )

    return { calculateBottomInsets }
}
