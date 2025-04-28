import { default as React } from "react"
import { ViewProps } from "react-native"
import Animated from "react-native-reanimated"
import { Stroke } from "./Stroke"
import { useSpinAnimation } from "./useSpinAnimation"

export const Spinner = ({ style, color }: { style?: ViewProps["style"]; color?: string }) => {
    const spinStyle = useSpinAnimation({ duration: 1000 })

    return (
        <Animated.View style={[spinStyle, style]}>
            <Stroke color={color} />
        </Animated.View>
    )
}
