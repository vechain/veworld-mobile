import { Switch, SwitchProps } from "react-native"
import React from "react"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants/Theme/Colors"

type Props = SwitchProps

export const BaseSwitch = ({ onValueChange, value, ...props }: Props) => {
    const theme = useTheme()

    return (
        <Switch
            trackColor={{
                false: theme.colors.primaryDisabled,
                true: theme.colors.switchEnabled,
            }}
            thumbColor={COLORS.WHITE}
            ios_backgroundColor={theme.colors.primaryDisabled}
            onValueChange={onValueChange}
            value={value}
            {...props}
        />
    )
}
