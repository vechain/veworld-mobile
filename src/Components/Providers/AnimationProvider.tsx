import React from "react"
import { ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"

interface Props extends AnimateProps<ViewProps> {
    children: React.ReactNode
}

export const AnimationProvider = ({
    children,
    ...animatedViewProps
}: Props) => {
    return <Animated.View {...animatedViewProps}>{children}</Animated.View>
}
