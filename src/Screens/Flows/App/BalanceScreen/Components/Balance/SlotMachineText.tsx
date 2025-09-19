import React, { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutChangeEvent, LayoutRectangle, StyleSheet, Text } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
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
    onLayout,
}: {
    item: (typeof VALUE_ARRAY)[number]
    translate: SharedValue<number>
    index: number
    onLayout: (e: LayoutChangeEvent) => void
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

    const [sizes, setSizes] = useState<LayoutRectangle[]>([])

    const parsedValue = useMemo(() => {
        if (!/\d/.test(value)) return 0
        return parseInt(value, 10)
    }, [value])

    const onLayout = useCallback(
        (index: number) => (e: LayoutChangeEvent) => {
            const rectangle = { ...e.nativeEvent.layout }
            setSizes(old => {
                const newArr = [...old]
                newArr[index] = rectangle
                return newArr
            })
        },
        [],
    )

    useEffect(() => {
        if (!/\d/.test(value)) return
        if (sizes.length !== 10) return

        translateY.value = withSpring(
            sizes.filter((_, idx) => idx < parsedValue).reduce((acc, curr) => acc + curr.height, 0),
            undefined,
        )
    }, [opacity, parsedValue, sizes, translateY, value])

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
                <Text style={[styles.text, styles.hiddenText]}>{parsedValue}</Text>
                {VALUE_ARRAY.map((item, idx) => (
                    <SlotMachineTextElement
                        key={idx}
                        item={item}
                        index={idx}
                        translate={translateY}
                        onLayout={e => onLayout(idx)(e)}
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
            fontSize: 38,
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
