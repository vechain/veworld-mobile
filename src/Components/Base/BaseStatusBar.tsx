import React, { memo, useMemo } from "react"
import { StatusBar, StatusBarProps } from "react-native"
import { useFeatureFlags } from "~Components/Providers"
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
    const featureFlags = useFeatureFlags()

    const barStyle = useMemo(() => {
        if (!props.root) return computeBarStyle(props.hero, theme.isDark)
        switch (routeName) {
            case Routes.HOME:
            case Routes.APPS_SEARCH:
            case Routes.APPS_TABS_MANAGER:
            case Routes.BROWSER:
                return "light-content"
            case Routes.TOKEN_DETAILS:
                return featureFlags?.betterWorldFeature?.balanceScreen?.tokens?.enabled
                    ? "light-content"
                    : computeBarStyle(props.hero, theme.isDark)
            default:
                return computeBarStyle(props.hero, theme.isDark)
        }
    }, [
        featureFlags?.betterWorldFeature?.balanceScreen?.tokens?.enabled,
        props.hero,
        props.root,
        routeName,
        theme.isDark,
    ])

    const backgroundColor = useMemo(() => {
        if (!props.root) return props.transparent ? theme.colors.transparent : theme.colors.background
        switch (routeName) {
            case Routes.HOME:
            case Routes.APPS_SEARCH:
            case Routes.APPS_TABS_MANAGER:
            case Routes.BROWSER:
                return COLORS.BALANCE_BACKGROUND
            case Routes.TOKEN_DETAILS:
                if (featureFlags?.betterWorldFeature?.balanceScreen?.tokens?.enabled) return COLORS.BLACK
                return props.transparent ? theme.colors.transparent : theme.colors.background
            default:
                return props.transparent ? theme.colors.transparent : theme.colors.background
        }
    }, [
        featureFlags?.betterWorldFeature?.balanceScreen?.tokens?.enabled,
        props.root,
        props.transparent,
        routeName,
        theme.colors.background,
        theme.colors.transparent,
    ])

    return <StatusBar translucent={props.hero} barStyle={barStyle} backgroundColor={backgroundColor} {...props} />
})
