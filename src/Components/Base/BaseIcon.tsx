/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import {
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewProps,
} from "react-native"
import { useTheme } from "~Common"
import Icon from "react-native-vector-icons/Ionicons"
import { IconProps } from "react-native-vector-icons/Icon"

type Props =
    | {
          size?: number
          bg?: string
          action?: () => void
      } & IconProps &
          TouchableOpacityProps &
          ViewProps

export const BaseIcon: React.FC<Props> = props => {
    const { color, ...otherProps } = props
    const theme = useTheme()

    const iconColor = useMemo(
        () =>
            color ||
            (theme.isDark ? theme.colors.tertiary : theme.colors.primary),
        [theme, color],
    )
    return (
        <BaseIconWrapper {...props}>
            <Icon size={props.size ?? 24} color={iconColor} {...otherProps} />
        </BaseIconWrapper>
    )
}

type BaseIconWrapperProps = Props & { children: React.ReactNode }
const BaseIconWrapper: React.FC<BaseIconWrapperProps> = ({
    style,
    bg,
    size,
    children,
    action,
}) => {
    if (action)
        return (
            <TouchableOpacity
                onPress={action}
                style={[
                    {
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: bg,
                        width: size ? size + 10 : 32,
                        height: size ? size + 10 : 32,
                        borderRadius: size ? size + 10 / 2 : 50,
                    },
                    style,
                ]}>
                {children}
            </TouchableOpacity>
        )
    return (
        <View
            style={[
                {
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: bg,
                    width: size ? size + 10 : 32,
                    height: size ? size + 10 : 32,
                    borderRadius: size ? size + 10 / 2 : 50,
                },
                style,
            ]}>
            {children}
        </View>
    )
}
