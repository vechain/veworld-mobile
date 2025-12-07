import React from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"
import { useThemedStyles } from "~Hooks"
import { useSendContext } from "../Provider"

type Props = Omit<AnimatedProps<ViewProps>, "entering" | "exiting">

export const SendContentContainer = ({ children, style, ...props }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { EnteringAnimation, ExitingAnimation, step } = useSendContext()
    return (
        <Animated.View
            style={[styles.root, style]}
            entering={EnteringAnimation}
            exiting={ExitingAnimation}
            key={step}
            {...props}>
            {children}
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
        },
    })
