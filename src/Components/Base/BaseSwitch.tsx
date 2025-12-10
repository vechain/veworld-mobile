import React, { useCallback, useEffect } from "react"
import { StyleSheet } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    interpolateColor,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    onValueChange: (newValue: boolean) => void
    value?: boolean
    testID?: string
}

/**
 * Calculated by doing 40(width)-2(padding from the left)-16(size of the ball)
 */
const LEFT_TRUE = 22
const LEFT_FALSE = 2

export const BaseSwitch = ({ onValueChange, value, testID }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const leftSharedValue = useSharedValue(value ? LEFT_TRUE : LEFT_FALSE)
    const baseValue = useSharedValue(0)

    useEffect(() => {
        //Align the value
        leftSharedValue.value = value ? LEFT_TRUE : LEFT_FALSE
    }, [leftSharedValue, value])

    useAnimatedReaction(
        () => leftSharedValue.value,
        current => {
            if (current !== LEFT_TRUE && current !== LEFT_FALSE) return
            if (current === LEFT_TRUE && !value) leftSharedValue.value = withTiming(LEFT_FALSE, { duration: 300 })
            if (current === LEFT_FALSE && value) leftSharedValue.value = withTiming(LEFT_TRUE, { duration: 300 })
        },
    )

    const toggleValue = useCallback(() => {
        const newValue = !value
        leftSharedValue.value = withTiming(newValue ? LEFT_TRUE : LEFT_FALSE, { duration: 300 }, () => {
            "worklet"
            runOnJS(onValueChange)(newValue)
        })
    }, [leftSharedValue, onValueChange, value])

    const tap = Gesture.Tap().onEnd(toggleValue)
    const pan = Gesture.Pan()
        .onStart(() => {
            baseValue.value = leftSharedValue.value
        })
        .onUpdate(e => {
            let newValue = e.translationX + baseValue.value
            if (newValue <= LEFT_FALSE) newValue = LEFT_FALSE
            if (newValue >= LEFT_TRUE) newValue = LEFT_TRUE
            leftSharedValue.value = newValue
        })
        .onEnd(() => {
            "worklet"
            if (leftSharedValue.value <= LEFT_FALSE) {
                leftSharedValue.value = LEFT_FALSE
                runOnJS(onValueChange)(false)
            } else if (leftSharedValue.value >= LEFT_TRUE) {
                leftSharedValue.value = LEFT_TRUE
                runOnJS(onValueChange)(true)
            } else leftSharedValue.value = value ? LEFT_TRUE : 2
        })

    const rootAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                leftSharedValue.value,
                [2, LEFT_TRUE],
                [theme.colors.switch.false, theme.colors.switch.true],
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
            <Animated.View style={[styles.root, rootAnimatedStyles]} testID={testID}>
                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.ball, ballStyles]} />
                </GestureDetector>
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
