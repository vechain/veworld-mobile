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
    /**
     * Number of repetitions.
     * @default -1 (infinite)
     */
    repetition?: number
    /**
     * Perform half of the transition.
     * @default false
     */
    half?: boolean
}

const ANIMATION_DURATION = 600

export const RollingFadingTextElement = ({
    value,
    index,
    totalChars,
    repetition = -1,
    half,
}: {
    value: string
    index: number
    totalChars: number
} & Pick<Props, "repetition" | "half">) => {
    const sharedValue = useSharedValue(0)
    const { styles } = useThemedStyles(baseStyles)

    useEffect(() => {
        sharedValue.value = withRepeat(
            withSequence(
                withDelay(index * ANIMATION_DURATION, withTiming(1, { duration: ANIMATION_DURATION })),
                withTiming(1, { duration: ANIMATION_DURATION * (totalChars - index - 1) }),
                ...(!half
                    ? [
                          withDelay(
                              ANIMATION_DURATION * (totalChars - index - 1),
                              withTiming(0, { duration: ANIMATION_DURATION }),
                          ),
                          withTiming(0, { duration: ANIMATION_DURATION * index }),
                      ]
                    : []),
            ),
            repetition,
            false,
        )
    }, [half, index, repetition, sharedValue, totalChars])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: sharedValue.value,
        }
    }, [sharedValue.value])
    return <Animated.Text style={[animatedStyles, styles.text]}>{value}</Animated.Text>
}

export const RollingFadingText = ({ text, repetition, half }: Props) => {
    const splittedText = useMemo(() => text.split(""), [text])

    return (
        <BaseView flexDirection="row">
            {splittedText.map((value, idx, arr) => (
                <RollingFadingTextElement
                    key={idx}
                    value={value}
                    index={idx}
                    totalChars={arr.length}
                    repetition={repetition}
                    half={half}
                />
            ))}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        text: { color: COLORS.GREY_50, fontWeight: 600, fontSize: 36, fontFamily: "Inter-SemiBold", lineHeight: 40 },
    })
