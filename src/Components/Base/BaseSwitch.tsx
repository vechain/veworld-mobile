import { Switch, SwitchProps } from "react-native"
import React, { useMemo } from "react"
import { useTheme } from "~Hooks"
import { PlatformUtils } from "~Utils"

type Props = SwitchProps

export const BaseSwitch = ({ onValueChange, value, ...props }: Props) => {
    const theme = useTheme()

    const thumbColor = useMemo(() => {
        if (PlatformUtils.isAndroid()) {
            return theme.isDark ? theme.colors.text : theme.colors.textReversed
        }

        if (!value)
            return theme.isDark ? theme.colors.text : theme.colors.textReversed

        return theme.colors.textReversed
    }, [theme, value])

    return (
        <Switch
            trackColor={{
                false: theme.colors.primaryDisabled,
                true: theme.colors.primary,
            }}
            thumbColor={thumbColor}
            ios_backgroundColor={theme.colors.primaryDisabled}
            onValueChange={onValueChange}
            value={value}
            {...props}
        />
    )
}
