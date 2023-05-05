import { StyleSheet } from "react-native"
import { ColorThemeType, ColorTheme } from "../Theme/Theme"
import { useAppSelector } from "~Storage/Redux"
import { selectTheme } from "~Storage/Redux/Selectors"
import { useColorScheme } from "./useColorScheme/useColorScheme"
import { ThemeEnum } from "~Common/Enums"
import { useCallback } from "react"

export const useTheme = (): ColorThemeType => {
    const theme = useAppSelector(selectTheme)
    const systemColorScheme = useColorScheme()

    const getThemeColor = useCallback(() => {
        switch (theme) {
            case ThemeEnum.SYSTEM:
                return systemColorScheme
            case ThemeEnum.DARK:
                return ThemeEnum.DARK
            case ThemeEnum.LIGHT:
                return ThemeEnum.LIGHT
            default:
                return systemColorScheme
        }
    }, [systemColorScheme, theme])

    return ColorTheme(getThemeColor())
}

export const useThemedStyles = <T,>(
    styles: (theme: ColorThemeType) => StyleSheet.NamedStyles<T>,
) => {
    const theme = useTheme()
    return { styles: styles(theme), theme }
}
