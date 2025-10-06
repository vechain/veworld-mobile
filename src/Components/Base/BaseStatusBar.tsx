import React, { memo, useMemo } from "react"
import { StatusBar, StatusBarProps } from "react-native"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { Routes } from "~Navigation"
import { selectCurrentScreen, useAppSelector } from "~Storage/Redux"
import { computeBarStyle } from "./Helpers/ComputeBarStyle"

type Props = {
    hero?: boolean
    transparent?: boolean
    /**
     * Indicate that this is the root status bar
     */
    root?: boolean
} & StatusBarProps

export const BaseStatusBar = memo((props: Props) => {
    const theme = useTheme()

    const routeName = useAppSelector(selectCurrentScreen)

    const barStyle = useMemo(() => {
        if (!props.root) return computeBarStyle(props.hero, theme.isDark)
        switch (routeName) {
            case Routes.HOME:
                return "light-content"
            default:
                return computeBarStyle(props.hero, theme.isDark)
        }
    }, [props.hero, props.root, routeName, theme.isDark])

    const backgroundColor = useMemo(() => {
        if (!props.root) return props.transparent ? theme.colors.transparent : theme.colors.background
        switch (routeName) {
            case Routes.HOME:
                return COLORS.BALANCE_BACKGROUND
            default:
                return props.transparent ? theme.colors.transparent : theme.colors.background
        }
    }, [props.root, props.transparent, routeName, theme.colors.background, theme.colors.transparent])

    return <StatusBar translucent={props.hero} barStyle={barStyle} backgroundColor={backgroundColor} {...props} />
})
