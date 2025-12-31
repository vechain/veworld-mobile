import React from "react"
import { StyleSheet } from "react-native"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import { useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

export type BaseBottomSheetV2BackdropProps = {
    /**
     * Custom color function to be used as the background.
     * @default black with the max opacity set to 1
     * @param args Arguments used to calculate the opacity
     * @returns A valid color string
     */
    colorFn?: (args: { translateY: SharedValue<number>; height: SharedValue<number> }) => string
}

export const BaseBottomSheetV2Backdrop = ({ colorFn }: BaseBottomSheetV2BackdropProps) => {
    const { height, translateY, onClose } = useBaseBottomSheetV2()
    const backdropStyles = useAnimatedStyle(() => {
        const colorFnResult = colorFn?.({ translateY, height })
        return {
            backgroundColor:
                colorFnResult ??
                `rgba(0, 0, 0, ${interpolate(translateY.value, [0, height.value], [0.85, 0], Extrapolation.CLAMP)})`,
        }
    }, [translateY])
    return <Animated.View style={[StyleSheet.absoluteFillObject, backdropStyles]} onTouchStart={onClose} />
}
