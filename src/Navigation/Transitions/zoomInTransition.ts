import { StackCardInterpolationProps, StackCardStyleInterpolator } from "@react-navigation/stack"
import { Animated } from "react-native"
import { COLORS } from "~Constants"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

export const zoomInTransition: StackCardStyleInterpolator = ({
    current,
    next: coveringCard,
}: StackCardInterpolationProps) => {
    // Same as slideFadeInTransition: Android never undoes the covered card's style
    const next = isIOS() ? coveringCard : undefined

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
        outputRange: [COLORS.TRANSPARENT, COLORS.APP_BACKGROUND_DARK, COLORS.APP_BACKGROUND_DARK],
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
