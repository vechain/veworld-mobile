import { StackCardInterpolationProps, StackCardStyleInterpolator } from "@react-navigation/stack"
import { Animated } from "react-native"
import { COLORS } from "~Constants"

export const zoomInTransition: StackCardStyleInterpolator = ({ current, next }: StackCardInterpolationProps) => {
    const scale = current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 1],
        extrapolate: "clamp",
    })

    const scaleClosing = next?.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 1],
        extrapolate: "clamp",
    })

    const scaleProgress = Animated.add(scale, scaleClosing ?? 1)

    const backgroundColor = current.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [COLORS.TRANSPARENT, COLORS.DARK_PURPLE, COLORS.DARK_PURPLE],
        extrapolate: "clamp",
    })

    return {
        cardStyle: {
            transform: [
                {
                    scale: scaleProgress.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [1, 0.2, 1],
                        extrapolate: "clamp",
                    }),
                },
            ],
            opacity: 1,
        },
        containerStyle: {
            backgroundColor: backgroundColor,
            opacity: 1,
        },
    }
}
