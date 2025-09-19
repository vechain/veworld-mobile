import React, { useEffect } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, {
    Extrapolation,
    FadeIn,
    FadeOut,
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated"
import { COLORS } from "~Constants"
import { usePrevious, useThemedStyles } from "~Hooks"

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
}: {
    item: (typeof VALUE_ARRAY)[number]
    translate: SharedValue<number>
    opacity: SharedValue<number>
    index: number
    style: StyleProp<ViewStyle>
    target: number
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
            entering={FadeIn.duration(300)}>
            {item.value}
        </Animated.Text>
    )
}

export const SlotMachineText = ({ value }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const previousValue = usePrevious(value)

    const translateY = useSharedValue(0)
    const opacity = useSharedValue(0)

    useEffect(() => {
        if (!/\d/.test(value)) return
        // console.log("SCROLLING TO", 20 + parseInt(value, 10))
        // ref.current.scrollToIndex({ index: 20 + parseInt(value, 10), animated: true })
        const parsed = parseInt(value, 10)
        opacity.value = 1
        const previousParsed = parseInt(/\d/.test(previousValue || "") ? previousValue ?? "0" : "0", 10)
        translateY.value = withSpring(
            40 * interpolate(parsed, [0, 9], [previousParsed, parsed], Extrapolation.EXTEND),
            undefined,
            () => {
                "worklet"
                opacity.value = 0
            },
        )
    }, [opacity, previousValue, translateY, value])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            // height: 40 * scale.value,
        }
    }, [])

    if (!/\d/.test(value))
        return (
            <Animated.Text style={styles.text} exiting={FadeOut.duration(300)} entering={FadeIn.duration(300)}>
                {value}
            </Animated.Text>
        )

    return (
        // <Animated.FlatList
        //     data={VALUE_ARRAY}
        //     keyExtractor={item => item.id}
        //     renderItem={renderItem}
        //     showsVerticalScrollIndicator={false}
        //     ref={ref}
        //     horizontal={false}
        //     style={styles.flatlist}
        //     getItemLayout={(v, index) => ({ length: 40, offset: 40 * index, index })}
        // />
        <Animated.View style={[styles.root, animatedStyles]}>
            {VALUE_ARRAY.map((item, idx) => (
                <T
                    item={item}
                    index={idx}
                    translate={translateY}
                    style={{}}
                    opacity={opacity}
                    target={parseInt(value, 10)}
                />
            ))}
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
        flatlist: {
            // alignItems: "flex-start",
            flexGrow: 0,
            // width: "auto",
            height: 40,
        },
        root: {
            height: 50,
            width: 40,
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
        },
    })
