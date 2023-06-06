import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useMemo } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PlatformUtils } from "~Utils"

export const usePlatformBottomInsets = () => {
    const _paddingBottom = useBottomTabBarHeight()
    const insets = useSafeAreaInsets()

    const calculateBottomInsets: number = useMemo(
        () => (PlatformUtils.isIOS() ? _paddingBottom - insets.bottom : 0),
        [_paddingBottom, insets.bottom],
    )

    return { calculateBottomInsets }
}
