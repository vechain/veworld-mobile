import React from "react"
import {
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"

type Props = {
    children: React.ReactNode
    action: () => void
} & TouchableOpacityProps

export const BaseTouchableBox: React.FC<Props> = ({
    children,
    action,
    style,
    ...props
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <DropShadow style={theme.shadows.card}>
            <TouchableOpacity
                onPress={action}
                style={[styles.container, style]}
                {...props}>
                {children}
            </TouchableOpacity>
        </DropShadow>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        shadow: theme.shadows.card,
        container: {
            justifyContent: "center",
            width: "100%",
            alignItems: "stretch",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: theme.colors.card,
        },
    })
