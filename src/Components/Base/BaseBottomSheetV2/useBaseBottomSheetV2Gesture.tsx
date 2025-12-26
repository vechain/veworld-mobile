import { useMemo } from "react"
import { Gesture } from "react-native-gesture-handler"
import { clamp, runOnJS, withTiming } from "react-native-reanimated"
import { PlatformUtils } from "~Utils"
import { useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

const INITIAL_POS_Y_SCROLL = 0
const SCROLL_THRESHOLD = 4

export const useBaseBottomSheetV2Gesture = () => {
    const { scrollY, onClose } = useBaseBottomSheetV2()
    const nativeGesture = useMemo(() => Gesture.Native(), [])

    // This is needed on iOS only because the scroll view works in a different way than on Android
    // Also on Android this gesture block the scroll completely
    const scrollPanGesture = useMemo(
        () =>
            Gesture.Pan()
                .onUpdate(({ translationY }) => {
                    const clampedValue = clamp(translationY, 0, 0)
                    scrollY.value = clampedValue
                })
                .onFinalize(({ translationY }) => {
                    const scrollGoBackAnimation = withTiming(INITIAL_POS_Y_SCROLL)
                    if (translationY >= SCROLL_THRESHOLD && scrollY.get() <= 0) {
                        runOnJS(onClose)()
                        scrollY.value = scrollGoBackAnimation
                    }
                })
                .enabled(PlatformUtils.isIOS()),
        [onClose, scrollY],
    )

    return useMemo(() => Gesture.Simultaneous(scrollPanGesture, nativeGesture), [nativeGesture, scrollPanGesture])
}
