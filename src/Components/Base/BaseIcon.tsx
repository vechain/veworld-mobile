/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import { TouchableOpacity, TouchableOpacityProps } from "react-native"
import { useTheme } from "~Common"
import Icon from "react-native-vector-icons/Ionicons"
import { IconProps } from "react-native-vector-icons/Icon"

type Props = {
    size?: number
    bg?: string
    isTouchable?: boolean
    action?: () => void
} & IconProps &
    TouchableOpacityProps

export const BaseIcon = (props: Props) => {
    const { style, color, ...otherProps } = props
    const theme = useTheme()

    const iconColor = useMemo(
        () =>
            color ||
            (theme.isDark ? theme.colors.tertiary : theme.colors.primary),
        [theme, color],
    )
    return (
        <TouchableOpacity
            onPress={props.action}
            style={[
                {
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: props.bg,
                    width: props.size ? props.size + 10 : 32,
                    height: props.size ? props.size + 10 : 32,
                    borderRadius: props.size ? props.size + 10 / 2 : 50,
                },
                style,
            ]}>
            <Icon size={props.size ?? 24} color={iconColor} {...otherProps} />
        </TouchableOpacity>
    )
}
