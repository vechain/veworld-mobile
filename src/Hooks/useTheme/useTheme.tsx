import { useMemo } from "react"
import { StyleSheet } from "react-native"
import { usePersistedTheme } from "~Components/Providers/PersistedThemeProvider/PersistedThemeProvider"
import { ThemeEnum } from "~Constants"
import { ColorTheme, ColorThemeType } from "../../Constants/Theme/Theme"
import { useColorScheme } from "../useColorScheme/useColorScheme"

export const useTheme = (): ColorThemeType => {
    const { theme } = usePersistedTheme()

    const systemColorScheme = useColorScheme()

    const themeColor = useMemo(() => {
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

    return useMemo(() => ColorTheme(themeColor), [themeColor])
}

export const useThemedStyles = <T,>(styles: (theme: ColorThemeType) => StyleSheet.NamedStyles<T>) => {
    const theme = useTheme()
    return useMemo(() => ({ styles: styles(theme), theme }), [styles, theme])
}
