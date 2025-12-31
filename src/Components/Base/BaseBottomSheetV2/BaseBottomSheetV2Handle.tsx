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

    const { translateY, height, onDismiss, snapIndex, setSnapIndex } = useBaseBottomSheetV2()

    const gesture = useMemo(() => {
        return Gesture.Pan()
            .onUpdate(v => {
                if (v.translationY < 0) {
                    translateY.value =
                        Math.max(v.translationY * 0.4, -BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION) +
                        BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION
                } else {
                    translateY.value =
                        Math.max(v.translationY, -BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION) +
                        BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION
                }
            })
            .onEnd(() => {
                "worklet"
                //If reached the top, increment the snap index
                if (translateY.get() === 0) {
                    setSnapIndex(snapIndex + 1)
                }
                // If more than 40%, then close the bottomsheet
                if (translateY.get() >= (height.get() * 2) / 5) {
                    runOnJS(onDismiss)()
                    return
                }
                if (translateY.get() >= 0.1 * height.get()) {
                    setSnapIndex(snapIndex - 1)
                }
                translateY.value = withSpring(BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION, {
                    mass: 4,
                    damping: 120,
                    stiffness: 900,
                })
            })
    }, [height, onDismiss, setSnapIndex, snapIndex, translateY])

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
