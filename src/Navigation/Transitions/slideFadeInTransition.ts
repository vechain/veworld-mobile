import { StackCardInterpolationProps, StackCardStyleInterpolator } from "@react-navigation/stack"
import { COLORS } from "~Constants"

export const slideFadeInTransition: StackCardStyleInterpolator = ({ current }: StackCardInterpolationProps) => {
    const translateY = current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [800, 0],
        extrapolate: "clamp",
    })

    const containerOpacity = current.progress.interpolate({
        inputRange: [0, 0.4, 1],
        outputRange: [0, 0.6, 1],
    })

    return {
        cardStyle: {
            transform: [{ translateY }],
        },
        containerStyle: {
            opacity: containerOpacity,
            backgroundColor: COLORS.DARK_PURPLE,
        },
    }
}
