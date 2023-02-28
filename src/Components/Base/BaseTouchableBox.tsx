import React from "react"
import { StyleSheet, TouchableOpacityProps } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import DropShadow from "react-native-drop-shadow"
import { useTheme, useThemedStyles } from "~Common"
import { ThemeType } from "~Model"

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
    const theme = useTheme()
    const themedStyle = useThemedStyles(styles)
    return (
        <DropShadow style={theme.shadows.card}>
            <TouchableOpacity
                onPress={action}
                style={[themedStyle.container, style]}
                {...props}>
                {children}
            </TouchableOpacity>
        </DropShadow>
    )
}

const styles = (theme: ThemeType) =>
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
