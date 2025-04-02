import React, { useCallback, useState } from "react"
import { useThemedStyles } from "~Hooks"
import { AnimatedHeaderButton } from "./AnimatedHeaderButton"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { typography } from "~Constants"

type Props = {
    action: () => void
    testID?: string
}

const { fontFamily } = typography

const animationDuration = 350

export const AnimatedSaveHeaderButton = ({ action, testID = "Reorder-HeaderIcon" }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const hasBeenClicked = useSharedValue(0)
    const [buttonText, setButtonText] = useState("Save")

    const handlePress = () => {
        hasBeenClicked.value = 1
        setButtonText("Saved!")
    }

    const onPress = useCallback(() => {
        hasBeenClicked.value = 0
        setButtonText("Save")
        action()
    }, [hasBeenClicked, action])

    const containerAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(
                hasBeenClicked.value ? theme.colors.successVariant.background : theme.colors.card,
                {
                    duration: animationDuration,
                },
                hasBeenClicked.value === 1
                    ? () => {
                          runOnJS(onPress)()
                      }
                    : undefined,
            ),
            borderColor: withTiming(
                hasBeenClicked.value ? theme.colors.transparent : theme.colors.rightIconHeaderBorder,
                {
                    duration: animationDuration,
                },
            ),
        }
    })

    const animatedStyles = useAnimatedStyle(() => {
        return {
            color: withTiming(hasBeenClicked.value ? theme.colors.successVariant.title : theme.colors.text, {
                duration: animationDuration,
            }),
            flex: 1,
        }
    })

    return (
        <AnimatedHeaderButton
            testID={testID}
            action={handlePress}
            animatedStyles={[containerAnimatedStyles, styles.buttonContainer]}>
            <Animated.Text style={[animatedStyles, styles.buttonLabel]}>{buttonText}</Animated.Text>
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
