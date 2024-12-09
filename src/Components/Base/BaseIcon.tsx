/* eslint-disable react-native/no-inline-styles */
import React, { memo, useCallback, useMemo } from "react"
import { OpaqueColorValue, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from "react-native"
import { useTheme } from "~Hooks"
import HapticsService from "~Services/HapticsService"
import { Icon } from "~Components"
import { IconProps } from "react-native-vector-icons/Icon"
import { designSystemIconMap } from "~Assets"

export type IconKey = keyof typeof designSystemIconMap

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
          borderRadius?: number
          iconPadding?: number
          name: IconKey
          color?: string | OpaqueColorValue
          haptics?: "Success" | "Warning" | "Error" | "Light" | "Medium" | "Heavy"
      } & IconProps &
          TouchableOpacityProps &
          ViewProps

export const BaseIcon: React.FC<Props> = memo(props => {
    const { color, style, borderRadius, testID, haptics, name, ...otherProps } = props
    const theme = useTheme()

    const iconColor = useMemo(
        () => color ?? (theme.isDark ? theme.colors.tertiary : theme.colors.primary),
        [theme, color],
    )

    return (
        <BaseIconWrapper
            testID={`${testID}-wrapper`}
            style={style}
            color={color}
            haptics={haptics}
            borderRadius={borderRadius}
            name={name}
            {...otherProps}>
            <Icon
                size={props.size ?? 22}
                testID={testID}
                color={iconColor}
                name={name}
                style={{ padding: props.iconPadding ?? 0 }}
                {...otherProps}
            />
        </BaseIconWrapper>
    )
})

type BaseIconWrapperProps = Props & { children: React.ReactNode }
const BaseIconWrapper: React.FC<BaseIconWrapperProps> = memo(
    ({ style, bg, borderRadius, size, children, action, haptics, ...props }) => {
        const onButtonPress = useCallback(() => {
            if (!action) return
            action()
            haptics && HapticsService.triggerHaptics({ haptics })
        }, [action, haptics])

        if (action)
            return (
                <TouchableOpacity
                    onPress={onButtonPress}
                    style={[
                        {
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: bg,
                            borderRadius: borderRadius || (size ? size + 10 / 2 : 50),
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
                        borderRadius: borderRadius || (size ? size + 10 / 2 : 50),
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
