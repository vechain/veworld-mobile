import React, { ReactNode } from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, { AnimatedProps, LinearTransition } from "react-native-reanimated"
import { useThemedStyles } from "~Hooks"
import { SendContentContainer } from "./SendContentContainer"
import { SendContentFooter } from "./SendContentFooter"
import { SendContentHeader } from "./SendContentHeader"

type Props = Omit<AnimatedProps<ViewProps>, "entering" | "exiting"> & {
    showHeader?: boolean
    footer?: ReactNode
}

const SendContent = ({ children, footer, style, showHeader = true, ...props }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <Animated.View style={[styles.root, style]} {...props}>
            {showHeader && <SendContent.Header />}
            <Animated.ScrollView
                layout={LinearTransition}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}>
                {children as ReactNode}
            </Animated.ScrollView>
            {footer && <SendContent.Footer>{footer}</SendContent.Footer>}
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            gap: 16,
        },
        contentContainer: {
            flexGrow: 1,
            justifyContent: "space-between",
        },
    })

SendContent.Container = SendContentContainer
SendContent.Header = SendContentHeader
SendContent.Footer = SendContentFooter

export { SendContent }
