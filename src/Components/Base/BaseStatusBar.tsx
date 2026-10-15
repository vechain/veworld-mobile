import React, { memo, useMemo } from "react"
import { SystemBars } from "react-native-edge-to-edge"
import { useTheme } from "~Hooks"
import { Routes } from "~Navigation"
import { selectCurrentScreen, useAppSelector } from "~Storage/Redux"
import { computeBarStyle } from "./Helpers/ComputeBarStyle"

type Props = {
    hero?: boolean
    /**
     * Indicate that this is the root status bar
     */
    root?: boolean
}

export const BaseStatusBar = memo(({ hero, root }: Props) => {
    const theme = useTheme()

    const routeName = useAppSelector(selectCurrentScreen)

    const barStyle = useMemo(() => {
        if (!root) return computeBarStyle(hero, theme.isDark)
        switch (routeName) {
            case Routes.HOME:
            case Routes.APPS_SEARCH:
            case Routes.APPS_TABS_MANAGER:
            case Routes.BROWSER:
            case Routes.TOKEN_DETAILS:
                return "light-content"

            default:
                return computeBarStyle(hero, theme.isDark)
        }
    }, [hero, root, routeName, theme.isDark])

    return <SystemBars style={barStyle === "light-content" ? "light" : "dark"} />
})
