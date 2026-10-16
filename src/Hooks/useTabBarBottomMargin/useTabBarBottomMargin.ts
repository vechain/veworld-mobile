import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs"
import { useCallback, useContext, useMemo } from "react"
import { PlatformType } from "~Constants"
import { PlatformUtils } from "~Utils"

const ANDROID_DEFAULT_PADDING = 24

export const useTabBarBottomMargin = () => {
    // The hook form throws outside a tab navigator; these screens render in both.
    const rawPadding = useContext(BottomTabBarHeightContext) ?? 0

    const getPadding = useCallback(
        (onlyForThisPlatform?: PlatformType) => {
            if (onlyForThisPlatform === PlatformType.ANDROID) {
                if (!PlatformUtils.isAndroid()) {
                    return 0
                }

                // Known React Navigation issue: sometimes Android returns 0 or too small values.
                if (rawPadding <= 0) {
                    return ANDROID_DEFAULT_PADDING
                }

                return rawPadding
            }

            if (onlyForThisPlatform === PlatformType.IOS) {
                if (!PlatformUtils.isIOS()) {
                    return 0
                }

                return rawPadding
            }

            return rawPadding
        },
        [rawPadding],
    )

    const iosOnlyTabBarBottomMargin: number = useMemo(() => getPadding(PlatformType.IOS), [getPadding])

    const androidOnlyTabBarBottomMargin: number = useMemo(() => getPadding(PlatformType.ANDROID), [getPadding])

    const tabBarBottomMargin: number = useMemo(() => getPadding(), [getPadding])

    return {
        iosOnlyTabBarBottomMargin,
        androidOnlyTabBarBottomMargin,
        tabBarBottomMargin,
    }
}
