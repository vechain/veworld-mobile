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
        <DropShadow style={[theme.shadows.card, styles.container, style]}>
            <TouchableOpacity
                onPress={action}
                style={[styles.innerContainer]}
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
                borderRadius: 16,
                width: "100%",
                backgroundColor: theme.colors.card,
                opacity: disabled ? 0.5 : 1,
            },
            innerContainer: {
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: direction,
                paddingHorizontal: 16,
                paddingVertical: 12,
            },
        })
