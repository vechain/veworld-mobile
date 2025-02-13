import React, { useMemo } from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { BlurView } from "./BlurView"
import Animated, { Extrapolation, interpolate, runOnJS, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import { useBottomSheet } from "@gorhom/bottom-sheet"
import { StyleSheet } from "react-native"
import { COLORS } from "~Constants"

type Props = {
    animatedIndex: SharedValue<number>
}

export const BlurBackdropBottomSheet = ({ animatedIndex }: Props) => {
    const { close } = useBottomSheet()

    const containerAnimatedStyle = useAnimatedStyle(
        () => ({
            opacity: interpolate(animatedIndex.value, [-1, 0, 1], [0, 1, 0.5], Extrapolation.CLAMP),
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
        }),
        [animatedIndex],
    )

    const tapHandler = useMemo(() => {
        const gesture = Gesture.Tap().onEnd(() => {
            runOnJS(close)()
        })
        return gesture
    }, [close])

    return (
        <GestureDetector gesture={tapHandler}>
            <Animated.View style={[containerAnimatedStyle]}>
                <BlurView
                    style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.DARK_PURPLE_TRANSPARENT }]}
                    blurAmount={4}
                    blurType={"dark"}
                />
            </Animated.View>
        </GestureDetector>
    )
}
