import { StyleSheet } from "react-native"
import { ColorThemeType, ColorTheme } from "../Theme/Theme"
import { useUserPreferencesEntity } from "./Entities"

export const useTheme = (): ColorThemeType => {
    const userPreferences = useUserPreferencesEntity()
    const theme = ColorTheme(userPreferences.theme)
    return theme
}

export const useThemedStyles = <T,>(
    styles: (theme: ColorThemeType) => StyleSheet.NamedStyles<T>,
) => {
    const theme = useTheme()
    return { styles: styles(theme), theme }
}
