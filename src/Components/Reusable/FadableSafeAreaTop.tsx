import { StyleSheet } from "react-native"
import React, { memo } from "react"
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
} from "react-native-reanimated"

export const FadableSafeAreaTop = memo(
    ({ scrollValue }: { scrollValue: Animated.SharedValue<number> }) => {
        const animStyle = useAnimatedStyle(() => {
            const opacity = interpolate(
                scrollValue.value,
                [-59, 15],
                [0, 0.85],
                {
                    extrapolateRight: Extrapolation.CLAMP,
                },
            )
            return { opacity: opacity }
        }, [])

        return <Animated.View style={[baseStyles.container, animStyle]} />
    },
)

const baseStyles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        opacity: 0.8,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 60,
    },
})
