import React, { useCallback, useState } from "react"
import { useThemedStyles } from "~Hooks"
import { AnimatedHeaderButton } from "./AnimatedHeaderButton"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { typography } from "~Constants"
import { LocalizedString } from "typesafe-i18n"

type Props = {
    action: () => void
    testID?: string
    buttonTextAfterClick?: LocalizedString
}

const { fontFamily } = typography

const animationDuration = 350

export const AnimatedSaveHeaderButton = ({ action, testID = "Reorder-HeaderIcon", buttonTextAfterClick }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const hasBeenClicked = useSharedValue(0)
    const [buttonText, setButtonText] = useState("Save")

    const handlePress = () => {
        hasBeenClicked.value = 1
        setButtonText(buttonTextAfterClick ?? "Saved!")
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
        }
    })

    return (
        <AnimatedHeaderButton
            testID={testID}
            disabled={hasBeenClicked.value === 1}
            action={handlePress}
            animatedStyles={[containerAnimatedStyles, styles.buttonContainer]}>
            <Animated.Text style={[animatedStyles, styles.buttonLabel]} numberOfLines={1}>
                {buttonText}
            </Animated.Text>
        </AnimatedHeaderButton>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        buttonContainer: {
            borderRadius: 100,
            paddingHorizontal: 16,
            paddingVertical: 7,
            justifyContent: "center",
            alignItems: "center",
        },
        buttonLabel: {
            fontFamily: fontFamily["Inter-SemiBold"],
            fontSize: 12,
            fontWeight: "600",
            textAlign: "center",
        },
    })
