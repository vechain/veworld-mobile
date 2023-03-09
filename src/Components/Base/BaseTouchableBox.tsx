import React from "react"
import {
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"

type JustifyContent =
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly"

type AlignItems = "flex-start" | "flex-end" | "center" | "stretch" | "baseline"

type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse"

type Props = {
    children: React.ReactNode
    action: () => void
    flexDirection?: FlexDirection
    justifyContent?: JustifyContent
    alignItems?: AlignItems
    containerStyle?: StyleProp<ViewStyle>
    innerContainerStyle?: StyleProp<ViewStyle>
    bg?: string
} & Omit<TouchableOpacityProps, "style">

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
    ...props
}) => {
    const { styles, theme } = useThemedStyles(
        baseStyles({ bg, flexDirection, justifyContent, alignItems, disabled }),
    )
    return (
        <DropShadow
            style={[theme.shadows.card, styles.container, containerStyle]}>
            <TouchableOpacity
                onPress={action}
                style={[styles.innerContainer, innerContainerStyle]}
                {...props}>
                {children}
            </TouchableOpacity>
        </DropShadow>
    )
}

type BaseStyles = {
    bg?: string
    flexDirection: FlexDirection
    justifyContent: JustifyContent
    alignItems: AlignItems
    disabled: boolean
}
const baseStyles =
    ({ bg, flexDirection, justifyContent, alignItems, disabled }: BaseStyles) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            shadow: theme.shadows.card,
            container: {
                width: "100%",
            },
            innerContainer: {
                justifyContent,
                alignItems,
                flexDirection,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: bg || theme.colors.card,
                opacity: disabled ? 0.5 : 1,
                borderRadius: 16,
                overflow: "hidden",
            },
        })
