import { Switch, ViewProps } from "react-native"
import React, { useState } from "react"
import { useTheme } from "~Common"

type Props = {
    trackColors?: string[]
    thumbColor?: string
    disabled?: boolean
    ios_bg?: string
    toggleAction: (isOn: boolean) => void
} & ViewProps

export const BaseSwitch = (props: Props) => {
    const theme = useTheme()
    const [isEnabled, setIsEnabled] = useState(false)
    const toggleSwitch = () => {
        props.toggleAction(!isEnabled)
        setIsEnabled(previousState => !previousState)
    }

    return (
        <Switch
            trackColor={{
                false: props.trackColors ? props.trackColors[0] : "#767577",
                true: props.trackColors
                    ? props.trackColors[1]
                    : theme.colors.primary,
            }}
            thumbColor={theme.colors.background}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
        />
    )
}
