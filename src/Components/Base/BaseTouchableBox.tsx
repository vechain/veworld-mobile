import React from "react"
import { StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import DropShadow from "react-native-drop-shadow"
import { useThemedStyles, useThemeType } from "~Common"

type Props = {
    action: () => void
    children: React.ReactNode
}
export const BaseTouchableBox: React.FC<Props> = ({ action, children }) => {
    const themedStyle = useThemedStyles(styles)
    return (
        <DropShadow style={themedStyle.shadow}>
            <TouchableOpacity onPress={action} style={themedStyle.container}>
                {children}
            </TouchableOpacity>
        </DropShadow>
    )
}

const styles = (theme: useThemeType) =>
    StyleSheet.create({
        shadow: {
            shadowColor: "#0B004314",
            shadowOffset: {
                height: 0,
                width: 0,
            },
            shadowOpacity: 0.08,
            shadowRadius: 16,
        },
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
