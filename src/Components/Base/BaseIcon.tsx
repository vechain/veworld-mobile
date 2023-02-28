/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import {
    ViewProps,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native"
import { useTheme } from "~Common"
import Icon from "react-native-vector-icons/Ionicons"

type Props = {
    title: string
    size?: number
    bg?: string
    isTouchable?: boolean
    action?: () => void
} & ViewProps &
    TouchableOpacityProps

export const BaseIcon = (props: Props) => {
    const { style, ...otherProps } = props
    const theme = useTheme()

    const iconColor = useMemo(
        () => (theme.isDark ? theme.colors.tertiary : theme.colors.primary),
        [theme],
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
            <Icon
                name={props.title}
                size={props.size ?? 24}
                color={iconColor}
                {...otherProps}
            />
        </TouchableOpacity>
    )
}
