import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    value: string
}

const VALUE_ARRAY = Array.from({ length: 10 }, (_, idx) => ({ id: idx.toString(), value: idx % 10 }))

const SlotMachineTextElement = ({
    item,
    translate,
    index,
}: {
    item: (typeof VALUE_ARRAY)[number]
    translate: SharedValue<number>
    index: number
}) => {
    const { styles } = useThemedStyles(baseStyles)

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -translate.value }],
        }
    }, [translate.value])
    return (
        <Animated.Text
            style={[styles.text, styles.absolute, animatedStyles, { top: 40 * index }]}
            key={item.id}
            exiting={FadeOut.duration(300)}
            entering={FadeIn.duration(300)}>
            {item.value}
        </Animated.Text>
    )
}

export const SlotMachineText = ({ value }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    const translateY = useSharedValue(0)

    const [hiddenValue, setHiddenValue] = useState(0)

    const parsedValue = useMemo(() => {
        if (!/\d/.test(value)) return 0
        return parseInt(value, 10)
    }, [value])

    useEffect(() => {
        if (!/\d/.test(value)) return
        translateY.value = withSpring(40 * parsedValue, undefined, () => {
            "worklet"
            runOnJS(setHiddenValue)(parsedValue)
        })
    }, [parsedValue, translateY, value])

    if (!/\d/.test(value))
        return (
            <Animated.Text style={styles.text} exiting={FadeOut.duration(300)} entering={FadeIn.duration(300)}>
                {value}
            </Animated.Text>
        )

    return (
        <Animated.View style={[styles.root]} layout={LinearTransition.duration(300)}>
            <LinearGradient
                colors={[COLORS.BALANCE_BACKGROUND, "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", COLORS.BALANCE_BACKGROUND]}
                angle={180}
                useAngle
                locations={[0, 0.2, 0.7, 1]}
                style={[StyleSheet.absoluteFill, styles.gradient]}
            />
            <Animated.View style={[styles.innerContainer]} layout={LinearTransition.duration(300)}>
                <Animated.Text style={[styles.text, styles.hiddenText]} layout={LinearTransition.duration(300)}>
                    {hiddenValue}
                </Animated.Text>
                {VALUE_ARRAY.map((item, idx) => (
                    <SlotMachineTextElement key={idx} item={item} index={idx} translate={translateY} />
                ))}
            </Animated.View>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        text: {
            color: COLORS.GREY_50,
            fontWeight: "600",
            fontSize: 38,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
            verticalAlign: "middle",
        },
        absolute: {
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "center",
        },
        root: {
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
            justifyContent: "center",
            height: 46,
        },
        innerContainer: {
            height: 40,
            position: "relative",
            overflow: "hidden",
        },
        hiddenText: {
            opacity: 0,
        },
        gradient: {
            zIndex: 1,
        },
    })
