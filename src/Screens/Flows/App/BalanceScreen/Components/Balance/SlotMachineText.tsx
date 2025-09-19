import React, { useEffect, useMemo, useState } from "react"
import { LayoutChangeEvent, LayoutRectangle, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, {
    FadeIn,
    FadeOut,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
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
    const overflow = useSharedValue(0)

    const [sizes, setSizes] = useState<LayoutRectangle[]>([])

    const parsedValue = useMemo(() => {
        if (!/\d/.test(value)) return 0
        return parseInt(value, 10)
    }, [value])

    useEffect(() => {
        if (!/\d/.test(value)) return
        if (sizes.length !== 10) return
        overflow.value = 1

        overflow.value = withTiming(0, { duration: 280 })

        translateY.value = withSpring(
            sizes.filter((_, idx) => idx < parsedValue).reduce((acc, curr) => acc + curr.height, 0),
            undefined,
        )
    }, [opacity, overflow, parsedValue, sizes, translateY, value])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            overflow: overflow.value > 0 ? "visible" : "hidden",
        }
    }, [overflow.value])

    if (!/\d/.test(value))
        return (
            <Animated.Text style={styles.text} exiting={FadeOut.duration(300)} entering={FadeIn.duration(300)}>
                {value}
            </Animated.Text>
        )

    return (
        <View style={[styles.root]}>
            <LinearGradient
                colors={[
                    COLORS.BALANCE_BACKGROUND,
                    "rgba(29, 23, 58, 0.7)",
                    "rgba(0, 0, 0, 0)",
                    "rgba(0, 0, 0, 0)",
                    "rgba(29, 23, 58, 0.7)",
                    COLORS.BALANCE_BACKGROUND,
                ]}
                angle={180}
                useAngle
                locations={[0, 0.2, 0.3, 0.7, 0.8, 1]}
                style={[StyleSheet.absoluteFill, styles.gradient]}
            />
            <Animated.View style={[styles.innerContainer, animatedStyles]}>
                <Text style={[styles.text, styles.hiddenText]}>{0}</Text>
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
        </View>
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
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
            justifyContent: "center",
            height: 70,
        },
        innerContainer: {
            height: 40,
            position: "relative",
        },
        hiddenText: {
            opacity: 0,
        },
        gradient: {
            zIndex: 1,
        },
    })
