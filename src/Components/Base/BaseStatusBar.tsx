import React, { memo, useMemo } from "react"
import { StatusBar, StatusBarProps } from "react-native"
import { useTheme } from "~Hooks"
import { computeBarStyle } from "./Helpers/ComputeBarStyle"

type Props = {
    hero?: boolean
    transparent?: boolean
} & StatusBarProps

export const BaseStatusBar = memo((props: Props) => {
    const theme = useTheme()

    const barStyle = useMemo(() => computeBarStyle(props.hero, theme.isDark), [props.hero, theme.isDark])

    return (
        <StatusBar
            translucent={props.hero}
            barStyle={barStyle}
            backgroundColor={props.transparent ? theme.colors.transparent : theme.colors.background}
            {...props}
        />
    )
})
