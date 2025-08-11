import React, { useCallback, useState } from "react"
import { useThemedStyles } from "~Hooks"
import { AnimatedHeaderButton } from "./AnimatedHeaderButton"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { ColorThemeType, typography } from "~Constants"
import { LocalizedString } from "typesafe-i18n"
import { useI18nContext } from "~i18n"

type Props = {
    action: () => void
    testID?: string
    buttonTextAfterClick?: LocalizedString
    rounded?: boolean
}

const { fontFamily } = typography

const animationDuration = 350

export const AnimatedSaveHeaderButton = ({
    action,
    testID = "Reorder-HeaderIcon",
    buttonTextAfterClick,
    rounded = false,
}: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const hasBeenClicked = useSharedValue(0)
    const [buttonText, setButtonText] = useState(LL.BTN_SAVE())

    const handlePress = () => {
        hasBeenClicked.value = 1
        setButtonText(buttonTextAfterClick ?? LL.BTN_SAVED())
    }

    const onPress = useCallback(() => {
        hasBeenClicked.value = 0
        setButtonText(LL.BTN_SAVE())
        action()
    }, [hasBeenClicked, action, LL])

    const containerAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(
                hasBeenClicked.value
                    ? theme.colors.successVariant.background
                    : theme.colors.actionBottomSheet.iconBackground,
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
            color: withTiming(
                hasBeenClicked.value ? theme.colors.successVariant.title : theme.colors.actionBottomSheet.icon,
                {
                    duration: animationDuration,
                },
            ),
        }
    })

    return (
        <AnimatedHeaderButton
            testID={testID}
            disabled={hasBeenClicked.value === 1}
            action={handlePress}
            animatedStyles={[containerAnimatedStyles, styles.buttonContainer, rounded && styles.rounded]}>
            <Animated.Text style={[animatedStyles, styles.buttonLabel]} numberOfLines={1}>
                {buttonText}
            </Animated.Text>
        </AnimatedHeaderButton>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        buttonContainer: {
            minWidth: 64,
            justifyContent: "center",
            alignItems: "center",
        },
        buttonLabel: {
            color: theme.colors.actionBottomSheet.icon,
            fontFamily: fontFamily["Inter-SemiBold"],
            fontSize: 12,
            fontWeight: "600",
            textAlign: "center",
        },
        rounded: {
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
    })
