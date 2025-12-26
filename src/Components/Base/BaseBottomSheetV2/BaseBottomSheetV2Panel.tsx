import React, { PropsWithChildren } from "react"
import { StyleSheet } from "react-native"
import { GestureDetector } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"
import { useBaseBottomSheetV2Gesture } from "./useBaseBottomSheetV2Gesture"
import { useBaseBottomSheetV2Transition } from "./useBaseBottomSheetV2Transition"

const PADDING_BOTTOM = 32

export const BaseBottomSheetV2Panel = ({ children }: PropsWithChildren) => {
    const { styles } = useThemedStyles(baseStyles)
    const { translateY, height } = useBaseBottomSheetV2()

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        }
    }, [translateY])

    const LayoutTransition = useBaseBottomSheetV2Transition()

    const gesture = useBaseBottomSheetV2Gesture()

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[styles.root, animatedStyle]}
                onLayout={e => {
                    height.value = e.nativeEvent.layout.height
                }}
                layout={LayoutTransition}>
                {children}
            </Animated.View>
        </GestureDetector>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_50,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            zIndex: 1,
            position: "relative",
            overflow: "hidden",
            paddingBottom: PADDING_BOTTOM,
            transformOrigin: "bottom",
            maxHeight: "100%",
        },
    })
