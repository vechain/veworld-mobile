import React, { useCallback, useEffect } from "react"
import { StyleSheet } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    onValueChange: (newValue: boolean) => void
    value: boolean | undefined
}

export const BaseSwitch = ({ onValueChange, value }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const leftSharedValue = useSharedValue(value ? 22 : 2)

    useEffect(() => {
        leftSharedValue.value = value ? 22 : 2
    }, [leftSharedValue, value])

    const toggleValue = useCallback(() => {
        const newValue = !value
        leftSharedValue.value = withTiming(newValue ? 22 : 2, { duration: 300 }, () => {
            "worklet"
            runOnJS(onValueChange)(newValue)
        })
    }, [leftSharedValue, onValueChange, value])

    const tap = Gesture.Tap().onEnd(toggleValue)

    const rootAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                leftSharedValue.value,
                [2, 22],
                [theme.colors.primaryDisabled, theme.colors.switchEnabled],
            ),
        }
    }, [leftSharedValue.value])

    const ballStyles = useAnimatedStyle(() => {
        return {
            left: leftSharedValue.value,
        }
    }, [leftSharedValue.value])

    return (
        <GestureDetector gesture={tap}>
            <Animated.View style={[styles.root, rootAnimatedStyles]}>
                <Animated.View style={[styles.ball, ballStyles]} />
            </Animated.View>
        </GestureDetector>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            borderRadius: 999,
            width: 40,
            height: 20,
            position: "relative",
        },
        ball: {
            backgroundColor: COLORS.WHITE,
            width: 16,
            height: 16,
            borderRadius: 8,
            position: "absolute",
            top: 2,
        },
    })
