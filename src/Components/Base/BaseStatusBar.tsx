import React, { memo, useMemo } from "react"
import { StatusBar, StatusBarProps } from "react-native"
import { useTheme } from "~Common"
import { computeBarStyle } from "./Helpers/ComputeBarStyle"

type Props = {
    hero?: boolean
    transparent?: boolean
    contentBasedOnScroll?: boolean
} & StatusBarProps

export const BaseStatusBar = memo((props: Props) => {
    const theme = useTheme()

    const barStyle = useMemo(() => {
        if (props.contentBasedOnScroll) {
            return "light-content"
        } else {
            return computeBarStyle(props.hero, theme.isDark)
        }
    }, [props.hero, theme.isDark, props.contentBasedOnScroll])

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
})
