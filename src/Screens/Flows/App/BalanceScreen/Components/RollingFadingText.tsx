import React, { useEffect, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import { BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    text: string
}

const RollingFadingTextElement = ({
    value,
    index,
    totalChars,
}: {
    value: string
    index: number
    totalChars: number
}) => {
    const sharedValue = useSharedValue(0)
    const { styles } = useThemedStyles(baseStyles)

    useEffect(() => {
        sharedValue.value = withRepeat(
            withSequence(
                withDelay(index * 600, withTiming(1, { duration: 600 })),
                withTiming(1, { duration: 600 * (totalChars - index - 1) }),
                withDelay(600 * (totalChars - index - 1), withTiming(0, { duration: 600 })),
                withTiming(0, { duration: 600 * index }),
            ),
            -1,
            false,
        )
    }, [index, sharedValue, totalChars])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: sharedValue.value,
        }
    }, [sharedValue.value])
    return <Animated.Text style={[animatedStyles, styles.text]}>{value}</Animated.Text>
}

export const RollingFadingText = ({ text }: Props) => {
    const splittedText = useMemo(() => text.split(""), [text])

    return (
        <BaseView flexDirection="row">
            {splittedText.map((value, idx, arr) => (
                <RollingFadingTextElement key={idx} value={value} index={idx} totalChars={arr.length} />
            ))}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        text: { color: COLORS.GREY_50, fontWeight: 600, fontSize: 36, fontFamily: "Inter-SemiBold" },
    })
