import React from "react"
import { useThemedStyles } from "~Hooks"
import { AnimatedHeaderButton } from "./AnimatedHeaderButton"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { typography } from "~Constants"

type Props = {
    action: () => void
    testID?: string
}

const { fontFamily } = typography

export const AnimatedSaveHeaderButton = ({ action, testID = "Reorder-HeaderIcon" }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const containerAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: theme.colors.card,
            borderColor: "transparent",
        }
    })

    const animatedStyles = useAnimatedStyle(() => {
        return {
            color: theme.colors.text,
            flex: 1,
        }
    })

    return (
        <AnimatedHeaderButton
            testID={testID}
            action={action}
            animatedStyles={[containerAnimatedStyles, styles.buttonContainer]}>
            <Animated.Text style={[animatedStyles, styles.buttonLabel]}>{"Save"}</Animated.Text>
        </AnimatedHeaderButton>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        buttonContainer: {
            minWidth: 64,
        },
        buttonLabel: {
            fontFamily: fontFamily["Inter-SemiBold"],
            fontSize: 12,
            fontWeight: "600",
            textAlign: "center",
        },
    })
