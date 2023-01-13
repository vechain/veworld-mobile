import React, { useMemo } from "react"
import { StatusBar, StatusBarProps } from "react-native"
import { useTheme } from "~Common"
import { computeBarStyle } from "./Helpers/ComputeBarStyle"

type Props = {
    hero?: boolean
    transparent?: boolean
} & StatusBarProps

export const BaseStatusBar = (props: Props) => {
    const theme = useTheme()

    const barStyle = useMemo(
        () => computeBarStyle(props.hero, theme.isDark),
        [props.hero, theme.isDark],
    )

    return (
        <StatusBar
            translucent={props.hero}
            barStyle={barStyle}
            backgroundColor={
                props.transparent
                    ? theme.constants.transparent
                    : theme.colors.background
            }
            {...props}
        />
    )
}
