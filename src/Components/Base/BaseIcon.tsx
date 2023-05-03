/* eslint-disable react-native/no-inline-styles */
import React, { memo, useMemo } from "react"
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
          m?: number
          mx?: number
          my?: number
          p?: number
          px?: number
          py?: number
      } & IconProps &
          TouchableOpacityProps &
          ViewProps

export const BaseIcon: React.FC<Props> = memo(props => {
    const { color, style, testID, ...otherProps } = props
    const theme = useTheme()

    const iconColor = useMemo(
        () =>
            color ||
            (theme.isDark ? theme.colors.tertiary : theme.colors.primary),
        [theme, color],
    )
    return (
        <BaseIconWrapper
            testID={`${testID}-wrapper`}
            style={style}
            color={color}
            {...otherProps}>
            <Icon
                size={props.size ?? 22}
                testID={testID}
                color={iconColor}
                {...otherProps}
            />
        </BaseIconWrapper>
    )
})

type BaseIconWrapperProps = Props & { children: React.ReactNode }
const BaseIconWrapper: React.FC<BaseIconWrapperProps> = memo(
    ({ style, bg, size, children, action, ...props }) => {
        if (action)
            return (
                <TouchableOpacity
                    onPress={action}
                    style={[
                        {
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: bg,
                            borderRadius: size ? size + 10 / 2 : 50,
                            opacity: props.disabled ? 0.5 : 1,
                            margin: props.m,
                            marginVertical: props.my,
                            marginHorizontal: props.mx,
                            padding: props.p ? props.p : bg ? 5 : 0,
                            paddingVertical: props.py,
                            paddingHorizontal: props.px,
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
                        padding: bg ? 5 : 0,
                        borderRadius: size ? size + 10 / 2 : 50,
                        opacity: props.disabled ? 0.5 : 1,
                    },
                    style,
                ]}
                {...props}>
                {children}
            </View>
        )
    },
)
