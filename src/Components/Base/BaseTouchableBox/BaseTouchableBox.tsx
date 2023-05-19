import React from "react"
import {
    StyleProp,
    StyleSheet,
    TouchableOpacityProps,
    ViewStyle,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import DropShadow from "react-native-drop-shadow"
import {
    AlignItems,
    ColorThemeType,
    FlexDirection,
    JustifyContent,
    useThemedStyles,
} from "~Common"
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
    w?: string | number
    px?: number
    py?: number
    flex?: number
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
    ...props
}) => {
    const { styles, theme } = useThemedStyles(
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
        }),
    )

    return (
        <DropShadow
            style={[theme.shadows.card, styles.container, containerStyle]}>
            <TouchableOpacity
                onPress={action}
                style={[styles.innerContainer, innerContainerStyle]}
                disabled={disabled}
                {...props}>
                {children}
            </TouchableOpacity>
        </DropShadow>
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
    }: BaseStyles) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            shadow: theme.shadows.card,
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
                opacity: disabled ? 0.5 : 1,
                borderRadius: 16,
                overflow: "hidden",
            },
        })
