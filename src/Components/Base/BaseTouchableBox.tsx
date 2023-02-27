import React from "react"
import { StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import DropShadow from "react-native-drop-shadow"
import { useTheme, useThemedStyles } from "~Common"
import { useThemeType } from "~Model"

type Props = {
    action: () => void
    children: React.ReactNode
}
export const BaseTouchableBox: React.FC<Props> = ({ action, children }) => {
    const theme = useTheme()
    const themedStyle = useThemedStyles(styles)
    return (
        <DropShadow style={theme.shadows.card}>
            <TouchableOpacity onPress={action} style={themedStyle.container}>
                {children}
            </TouchableOpacity>
        </DropShadow>
    )
}

const styles = (theme: useThemeType) =>
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
