import React from "react"
import { StyleSheet, TouchableOpacityProps } from "react-native"
import { TouchableOpacity } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"

type Props = {
    children: React.ReactNode
    action: () => void
    direction?: "row" | "column"
} & TouchableOpacityProps

export const BaseTouchableBox: React.FC<Props> = ({
    children,
    action,
    style,
    disabled = false,
    direction = "row",
    ...props
}) => {
    const { styles, theme } = useThemedStyles(baseStyles(direction, disabled))
    return (
        <DropShadow style={[theme.shadows.card, styles.container]}>
            <TouchableOpacity
                onPress={action}
                style={[styles.innerContainer, style]}
                {...props}>
                {children}
            </TouchableOpacity>
        </DropShadow>
    )
}

const baseStyles =
    (direction: "row" | "column", disabled: boolean) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            shadow: theme.shadows.card,
            container: {
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 16,
                width: "100%",
                backgroundColor: theme.colors.card,
                opacity: disabled ? 0.5 : 1,
            },
            innerContainer: {
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: direction,
            },
        })
