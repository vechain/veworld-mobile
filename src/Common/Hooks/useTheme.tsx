import { StyleProp } from "react-native"
import { ThemeType, ThemeVariant } from "~Model"
import { Theme } from "../Theme/Theme"
import { useColorScheme } from "./useColorScheme"

type useThemeType = Omit<ThemeType, "dark" | "light"> & ThemeVariant
export const useTheme = (): useThemeType => {
    const colorScheme = useColorScheme()
    const colorsTheme = Theme[colorScheme]
    const constants = Theme.constants
    const typography = Theme.typography
    return { ...colorsTheme, constants, typography }
}

export const useThemedStyles = <T,>(
    styles: (theme: useThemeType) => StyleProp<T>,
): StyleProp<T> => {
    const theme = useTheme()
    return styles(theme)
}
