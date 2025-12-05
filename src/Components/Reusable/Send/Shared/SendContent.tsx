import React from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"
import { useThemedStyles } from "~Hooks"
import { SendContentContainer } from "./SendContentContainer"
import { SendContentFooter } from "./SendContentFooter"
import { SendContentHeader } from "./SendContentHeader"

type Props = Omit<AnimatedProps<ViewProps>, "entering" | "exiting">

const SendContent = ({ children, style, ...props }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <Animated.View style={[styles.root, style]} {...props}>
            {children}
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            gap: 16,
        },
    })

SendContent.Container = SendContentContainer
SendContent.Header = SendContentHeader
SendContent.Footer = SendContentFooter

export { SendContent }
