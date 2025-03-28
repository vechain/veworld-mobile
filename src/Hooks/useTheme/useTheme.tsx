import { StyleSheet } from "react-native"
import { ColorThemeType, ColorTheme } from "../../Constants/Theme/Theme"
import { useColorScheme } from "../useColorScheme/useColorScheme"
import { ThemeEnum } from "~Constants"
import { useCallback } from "react"
import { usePersistedTheme } from "~Components/Providers/PersistedThemeProvider/PersistedThemeProvider"

export const useTheme = (): ColorThemeType => {
    const { theme } = usePersistedTheme()

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

export const useThemedStyles = <T,>(styles: (theme: ColorThemeType) => StyleSheet.NamedStyles<T>) => {
    const theme = useTheme()
    return { styles: styles(theme), theme }
}
