import React, { useCallback } from "react"
import { DimensionValue, StyleProp, StyleSheet, TouchableOpacity, TouchableOpacityProps, ViewStyle } from "react-native"

import { AlignItems, ColorThemeType, FlexDirection, JustifyContent } from "~Constants"
import { useThemedStyles } from "~Hooks"
import HapticsService from "~Services/HapticsService"
import { BaseView } from "../BaseView"
import { GenericTouchableProps } from "./Types"

type Props = {
    children: React.ReactNode
    action?: () => void
    flexDirection?: FlexDirection
    justifyContent?: JustifyContent
    alignItems?: AlignItems
    containerStyle?: StyleProp<ViewStyle>
    innerContainerStyle?: StyleProp<ViewStyle>
    bg?: string
    w?: DimensionValue
    px?: number
    py?: number
    flex?: number
    showOpacityWhenDisabled?: boolean
    haptics?: "Success" | "Warning" | "Error" | "Light" | "Medium" | "Heavy"
    opacity?: ViewStyle["opacity"]
} & Omit<TouchableOpacityProps, "style"> &
    GenericTouchableProps

export const BaseTouchableBox: React.FC<Props> = ({
    children,
    action,
    containerStyle,
    innerContainerStyle,
    disabled = false,
    flexDirection = "row",
    justifyContent = "flex-start",
    alignItems = "center",
    bg,
    w,
    px,
    py,
    flex,
    showOpacityWhenDisabled = true,
    haptics,
    opacity,
    ...props
}) => {
    const { styles } = useThemedStyles(
        baseStyles({
            bg,
            w,
            px,
            py,
            flexDirection,
            justifyContent,
            alignItems,
            disabled,
            flex,
            showOpacityWhenDisabled,
            opacity,
        }),
    )

    const onButtonPress = useCallback(() => {
        if (!action) return
        action()
        haptics && HapticsService.triggerHaptics({ haptics })
    }, [action, haptics])

    return (
        <BaseView style={[styles.container, containerStyle]}>
            <TouchableOpacity
                activeOpacity={action ? 0.3 : 1}
                onPress={onButtonPress}
                style={[styles.innerContainer, innerContainerStyle]}
                disabled={disabled}
                {...props}>
                {children}
            </TouchableOpacity>
        </BaseView>
    )
}

type BaseStyles = {
    bg?: string
    w?: DimensionValue
    px?: number
    py?: number
    flexDirection: FlexDirection
    justifyContent: JustifyContent
    alignItems: AlignItems
    disabled: boolean
    flex?: number
    showOpacityWhenDisabled?: boolean
    opacity?: ViewStyle["opacity"]
}

const baseStyles =
    ({
        bg,
        w,
        px = 16,
        py = 12,
        flexDirection,
        justifyContent,
        alignItems,
        disabled,
        flex,
        showOpacityWhenDisabled = true,
        opacity,
    }: BaseStyles) =>
    (theme: ColorThemeType) => {
        const getOpacity = () => {
            if (opacity) {
                return opacity
            } else {
                return disabled && showOpacityWhenDisabled ? 0.5 : 1
            }
        }

        return StyleSheet.create({
            container: {
                flex,
                width: w ?? "100%",
                borderRadius: 16,
                overflow: "hidden",
            },
            innerContainer: {
                justifyContent,
                alignItems,
                flexDirection,
                paddingHorizontal: px,
                paddingVertical: py,
                backgroundColor: bg ?? theme.colors.card,
                opacity: getOpacity(),
                borderRadius: 16,
                overflow: "hidden",
            },
        })
    }
