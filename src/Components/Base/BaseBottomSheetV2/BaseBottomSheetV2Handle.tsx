import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { runOnJS, withSpring } from "react-native-reanimated"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseBottomSheetHandle, BaseBottomSheetHandleProps } from "../BaseBottomSheetHandle"
import { BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION, useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

export const BaseBottomSheetV2Handle = ({ style, ...props }: Partial<BaseBottomSheetHandleProps>) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const { translateY, height, onDismiss } = useBaseBottomSheetV2()

    const gesture = useMemo(() => {
        return Gesture.Pan()
            .onUpdate(v => {
                translateY.value =
                    Math.max(v.translationY, -BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION) +
                    BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION
            })
            .onEnd(() => {
                "worklet"
                // If more than 40%, then close the bottomsheet
                if (translateY.value >= (height.get() * 2) / 5) {
                    runOnJS(onDismiss)()
                    return
                }
                translateY.value = withSpring(BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION, {
                    mass: 4,
                    damping: 120,
                    stiffness: 900,
                })
            })
    }, [height, onDismiss, translateY])

    return (
        <GestureDetector gesture={gesture}>
            <BaseBottomSheetHandle
                color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300}
                style={[styles.handle, style]}
                {...props}
            />
        </GestureDetector>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        handle: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_50,
            marginTop: 0,
            paddingTop: 16,
            paddingBottom: 16,
            zIndex: 1,
        },
    })
