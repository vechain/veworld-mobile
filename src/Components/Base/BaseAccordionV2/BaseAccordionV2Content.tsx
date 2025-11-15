import React, { PropsWithChildren } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"
import { useThemedStyles } from "~Hooks"
import { useBaseAccordionV2 } from "./BaseAccordionV2Context"

type Props = PropsWithChildren<{
    /**
     * Style of the root object.
     */
    style?: StyleProp<ViewStyle>
    /**
     * Style of the object containing children
     */
    innerStyle?: StyleProp<ViewStyle>
}>

export const BaseAccordionV2Content = ({ style, children, innerStyle }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const height = useSharedValue(0)
    const { open } = useBaseAccordionV2()

    const derivedHeight = useDerivedValue(
        () =>
            withTiming(height.value * Number(open), {
                duration: 500,
            }),
        [height.value, open],
    )

    const bodyStyle = useAnimatedStyle(
        () => ({
            height: derivedHeight.value,
        }),
        [derivedHeight.value],
    )

    return (
        <Animated.View style={[styles.root, bodyStyle, style]}>
            <View
                onLayout={e => {
                    height.value = e.nativeEvent.layout.height
                }}
                style={[styles.wrapper, innerStyle]}>
                {children}
            </View>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        wrapper: {
            width: "100%",
            position: "absolute",
            display: "flex",
            alignItems: "stretch",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
        },
        root: {
            overflow: "hidden",
            width: "100%",
        },
    })
