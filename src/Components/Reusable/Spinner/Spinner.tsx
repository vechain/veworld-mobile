import { ComponentProps, default as React } from "react"
import { ViewProps } from "react-native"
import Animated from "react-native-reanimated"
import { BaseIcon } from "~Components/Base/BaseIcon"
import { Stroke } from "./Stroke"
import { useSpinAnimation } from "./useSpinAnimation"

export const Spinner = ({
    style,
    color,
    duration = 1000,
}: {
    style?: ViewProps["style"]
    color?: string
    duration?: number
}) => {
    const spinStyle = useSpinAnimation({ duration })

    return (
        <Animated.View style={[spinStyle, style]}>
            <Stroke color={color} />
        </Animated.View>
    )
}

const AnimatedIcon = Animated.createAnimatedComponent(BaseIcon)
const SpinnableIcon = ({ duration, style, ...props }: ComponentProps<typeof BaseIcon> & { duration?: number }) => {
    const spinStyle = useSpinAnimation({ duration })
    return <AnimatedIcon style={[spinStyle, style]} {...props} />
}

Spinner.Icon = SpinnableIcon
