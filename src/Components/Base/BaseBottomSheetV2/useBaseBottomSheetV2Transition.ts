import { useCallback } from "react"
import { LayoutAnimation, LayoutAnimationsValues, withTiming } from "react-native-reanimated"
import { BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION, useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

export const useBaseBottomSheetV2Transition = () => {
    const { translateY } = useBaseBottomSheetV2()

    return useCallback(
        (values: LayoutAnimationsValues): LayoutAnimation => {
            "worklet"
            if (translateY.get() === BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION)
                return {
                    initialValues: {
                        originX: values.currentOriginX,
                        originY: values.currentOriginY,
                        width: values.currentWidth,
                        height: values.currentHeight,
                    },
                    animations: {
                        originX: withTiming(values.targetOriginX),
                        originY: withTiming(values.targetOriginY),
                        width: withTiming(values.targetWidth),
                        height: withTiming(values.targetHeight),
                    },
                }
            return {
                animations: {},
                initialValues: {
                    originX: values.currentOriginX,
                    originY: values.currentOriginY,
                    width: values.currentWidth,
                    height: values.currentHeight,
                },
            }
        },
        [translateY],
    )
}
