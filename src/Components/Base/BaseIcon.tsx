/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import {
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewProps,
} from "react-native"
import { useTheme } from "~Common"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
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
    const { color, style, ...otherProps } = props
    const theme = useTheme()

    const iconColor = useMemo(
        () =>
            color ||
            (theme.isDark ? theme.colors.tertiary : theme.colors.primary),
        [theme, color],
    )
    return (
        <BaseIconWrapper style={style} {...props}>
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
    ...props
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
                        padding: 8,
                        borderRadius: size ? size + 10 / 2 : 50,
                        opacity: props.disabled ? 0.5 : 1,
                    },
                    style,
                ]}
                {...props}>
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
                    padding: 8,
                    borderRadius: size ? size + 10 / 2 : 50,
                    opacity: props.disabled ? 0.5 : 1,
                },
                style,
            ]}
            {...props}>
            {children}
        </View>
    )
}
