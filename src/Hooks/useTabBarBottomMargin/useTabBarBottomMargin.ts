import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useCallback, useMemo } from "react"
import { PlatformType } from "~Constants"
import { PlatformUtils } from "~Utils"

export const useTabBarBottomMargin = () => {
    const padding = useBottomTabBarHeight() || 0

    const getPadding = useCallback(
        (onlyForThisPlatform?: PlatformType) => {
            if (onlyForThisPlatform === PlatformType.ANDROID) {
                if (PlatformUtils.isAndroid()) {
                    return padding
                }
                return 0
            }
            if (onlyForThisPlatform === PlatformType.IOS) {
                if (PlatformUtils.isIOS()) {
                    return padding
                }
                return 0
            }
            return padding
        },
        [padding],
    )

    const iosOnlyTabBarBottomMargin: number = useMemo(
        () => getPadding(PlatformType.IOS),
        [getPadding],
    )

    const androidOnlyTabBarBottomMargin: number = useMemo(
        () => getPadding(PlatformType.ANDROID),
        [getPadding],
    )

    const tabBarBottomMargin: number = useMemo(() => getPadding(), [getPadding])

    return {
        iosOnlyTabBarBottomMargin,
        androidOnlyTabBarBottomMargin,
        tabBarBottomMargin,
    }
}
