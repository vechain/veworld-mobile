import React, { useCallback } from "react"
import {
    StyleProp,
    StyleSheet,
    TouchableOpacityProps,
    ViewStyle,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import {
    AlignItems,
    ColorThemeType,
    FlexDirection,
    JustifyContent,
} from "~Constants"
import { useThemedStyles } from "~Hooks"
import { GenericTouchableProps } from "./Types"
import { BaseView } from "../BaseView"
import HapticsService from "~Services/HapticsService"

type Props = {
    children: React.ReactNode
    action?: () => void
    flexDirection?: FlexDirection
    justifyContent?: JustifyContent
    alignItems?: AlignItems
    containerStyle?: StyleProp<ViewStyle>
    innerContainerStyle?: StyleProp<ViewStyle>
    bg?: string
    w?: string | number
    px?: number
    py?: number
    flex?: number
    showOpacityWhenDisabled?: boolean
    haptics?: "Success" | "Warning" | "Error" | "Light" | "Medium" | "Heavy"
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
    w?: number | string
    px?: number
    py?: number
    flexDirection: FlexDirection
    justifyContent: JustifyContent
    alignItems: AlignItems
    disabled: boolean
    flex?: number
    showOpacityWhenDisabled?: boolean
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
    }: BaseStyles) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            container: {
                flex,
                width: w || "100%",
            },
            innerContainer: {
                justifyContent,
                alignItems,
                flexDirection,
                paddingHorizontal: px,
                paddingVertical: py,
                backgroundColor: bg || theme.colors.card,
                opacity: disabled && showOpacityWhenDisabled ? 0.5 : 1,
                borderRadius: 16,
                overflow: "hidden",
            },
        })
