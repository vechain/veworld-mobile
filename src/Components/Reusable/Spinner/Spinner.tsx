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
    size = 16,
    testID,
}: {
    style?: ViewProps["style"]
    color?: string
    duration?: number
    size?: number
    testID?: string
}) => {
    const spinStyle = useSpinAnimation({ duration })

    return (
        <Animated.View style={[spinStyle, style]} testID={testID}>
            <Stroke color={color} size={size} />
        </Animated.View>
    )
}

const AnimatedIcon = Animated.createAnimatedComponent(BaseIcon)
const SpinnableIcon = ({ duration, style, ...props }: ComponentProps<typeof BaseIcon> & { duration?: number }) => {
    const spinStyle = useSpinAnimation({ duration })
    return <AnimatedIcon style={[spinStyle, style]} {...props} />
}

Spinner.Icon = SpinnableIcon
