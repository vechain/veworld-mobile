import React, { useEffect, useState } from "react"
import { LayoutChangeEvent, LayoutRectangle, StyleProp, StyleSheet, Text, ViewStyle } from "react-native"
import Animated, {
    FadeIn,
    FadeOut,
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

// const VALUE_ARRAY = Array.from({ length: 30 }, (_, idx) => ({ id: idx.toString(), value: idx % 10 }))
const VALUE_ARRAY = Array.from({ length: 10 }, (_, idx) => ({ id: idx.toString(), value: idx % 10 }))

const T = ({
    item,
    translate,
    index,
    style,
    opacity,
    target,
    onLayout,
}: {
    item: (typeof VALUE_ARRAY)[number]
    translate: SharedValue<number>
    opacity: SharedValue<number>
    index: number
    style: StyleProp<ViewStyle>
    target: number
    onLayout: (e: LayoutChangeEvent) => void
}) => {
    const { styles } = useThemedStyles(baseStyles)

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -translate.value }],
            // opacity: target === item.value ? 1 : opacity.value,
        }
    }, [translate.value, opacity, target])
    return (
        <Animated.Text
            style={[styles.text, styles.absolute, animatedStyles, { top: 40 * index }, style]}
            key={item.id}
            exiting={FadeOut.duration(300)}
            entering={FadeIn.duration(300)}
            onLayout={onLayout}>
            {item.value}
        </Animated.Text>
    )
}

export const SlotMachineText = ({ value }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    const translateY = useSharedValue(0)
    const opacity = useSharedValue(0)
    const overflow = useSharedValue<"visible" | "hidden">("hidden")

    const [sizes, setSizes] = useState<LayoutRectangle[]>([])

    useEffect(() => {
        if (!/\d/.test(value)) return
        if (sizes.length !== 10) return
        const parsed = parseInt(value, 10)
        overflow.value = "visible"
        translateY.value = withSpring(
            sizes.filter((_, idx) => idx < parsed).reduce((acc, curr) => acc + curr.height, 0),
            undefined,
            () => {
                "worklet"
                overflow.value = "hidden"
            },
        )
    }, [opacity, overflow, sizes, translateY, value])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            overflow: overflow.value,
        }
    }, [overflow.value])

    if (!/\d/.test(value))
        return (
            <Animated.Text style={styles.text} exiting={FadeOut.duration(300)} entering={FadeIn.duration(300)}>
                {value}
            </Animated.Text>
        )

    return (
        <Animated.View style={[styles.root, { flexDirection: "column", justifyContent: "center", height: 70 }]}>
            <Animated.View style={[{ height: 40, position: "relative" }, animatedStyles]}>
                <Text style={[styles.text, styles.hiddenText]}>0</Text>
                {VALUE_ARRAY.map((item, idx) => (
                    <T
                        item={item}
                        index={idx}
                        translate={translateY}
                        style={{}}
                        opacity={opacity}
                        target={parseInt(value, 10)}
                        onLayout={e => {
                            const rectangle = { ...e.nativeEvent.layout }
                            setSizes(old => {
                                const newArr = [...old]
                                newArr[idx] = rectangle
                                return newArr
                            })
                        }}
                    />
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
            fontSize: 36,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
        },
        absolute: {
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "center",
        },
        root: {
            height: 50,
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
        },
        hiddenText: {
            opacity: 0,
        },
    })
