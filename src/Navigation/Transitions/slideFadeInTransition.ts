import { StackCardInterpolationProps, StackCardStyleInterpolator } from "@react-navigation/stack"
import { Animated } from "react-native"
import { COLORS } from "~Constants"

export const slideFadeInTransition: StackCardStyleInterpolator = ({
    current,
    next,
    layouts,
}: StackCardInterpolationProps) => {
    const translateY = current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: "clamp",
    })

    const translateYClosing = next?.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: "clamp",
    })

    const translateYProgress = Animated.add(translateY, translateYClosing ?? 0)

    const scale = next
        ? next.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.7],
              extrapolate: "clamp",
          })
        : 1

    const backgroundColor = current.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [COLORS.TRANSPARENT, COLORS.APP_BACKGROUND_DARK, COLORS.APP_BACKGROUND_DARK],
        extrapolate: "clamp",
    })

    return {
        cardStyle: {
            transform: [
                {
                    translateY: translateYProgress.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [layouts.screen.height, 0, layouts.screen.height * 0.8],
                        extrapolate: "extend",
                    }),
                },
                {
                    scale,
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
