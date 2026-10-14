import React from "react"
import { ViewProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"

interface Props extends AnimatedProps<ViewProps> {
    children: React.ReactNode
}

export const AnimationProvider = ({ children, ...animatedViewProps }: Props) => {
    return <Animated.View {...animatedViewProps}>{children}</Animated.View>
}
