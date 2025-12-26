import React from "react"
import { StyleSheet } from "react-native"
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated"
import { useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

export const BaseBottomSheetV2Backdrop = () => {
    const { height, translateY, onClose } = useBaseBottomSheetV2()
    const backdropStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: `rgba(0, 0, 0, ${interpolate(
                translateY.value,
                [0, height.value],
                [0.85, 0],
                Extrapolation.CLAMP,
            )})`,
        }
    }, [translateY])
    return <Animated.View style={[StyleSheet.absoluteFillObject, backdropStyles]} onTouchStart={onClose} />
}
