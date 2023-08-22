import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useCallback, useMemo } from "react"
import { PlatformType } from "~Constants"
import { PlatformUtils } from "~Utils"

export const useTabBarBottomMargin = () => {
    const paddingBottom = useBottomTabBarHeight()

    const getPadding = useCallback(
        (onlyForThisPlatform?: PlatformType) => {
            const padding = paddingBottom

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
        [paddingBottom],
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
