import React, { useCallback } from "react"
import { Pressable, StyleSheet } from "react-native"
import Animated, { interpolate, interpolateColor, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    onValueChange: (newValue: boolean) => void
    value?: boolean
    testID?: string
    disabled?: boolean
}

/**
 * Calculated by doing 44(width)-2(padding from the left)-20(size of the ball)
 */
const LEFT_TRUE = 22
const LEFT_FALSE = 2

export const BaseSwitch = ({ onValueChange, value, testID, disabled }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const toggleValue = useCallback(() => {
        if (disabled) return
        onValueChange(!value)
    }, [onValueChange, value, disabled])

    const rootAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(
                interpolateColor(Number(value), [0, 1], [theme.colors.switch.false, theme.colors.switch.true]),
                { duration: 300 },
            ),
        }
    }, [value])

    const ballStyles = useAnimatedStyle(() => {
        return {
            left: withTiming(interpolate(Number(value), [0, 1], [LEFT_FALSE, LEFT_TRUE]), { duration: 300 }),
        }
    }, [value])

    return (
        <Pressable onPress={toggleValue} testID={testID} style={disabled ? styles.disabled : undefined}>
            <Animated.View style={[styles.root, rootAnimatedStyles]}>
                <Animated.View style={[styles.ball, ballStyles]} />
            </Animated.View>
        </Pressable>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            borderRadius: 999,
            width: 44,
            height: 24,
            position: "relative",
        },
        ball: {
            backgroundColor: COLORS.WHITE,
            width: 20,
            height: 20,
            borderRadius: 999,
            position: "absolute",
            top: 2,
        },
        disabled: {
            opacity: 0.5,
        },
    })
