import { StyleSheet } from "react-native"
import { ColorThemeType, ColorTheme } from "../Theme/Theme"
import { useUserPreferencesEntity } from "./Entities"

export const useTheme = (): ColorThemeType => {
    const { theme } = useUserPreferencesEntity()
    return ColorTheme(theme)
}

export const useThemedStyles = <T,>(
    styles: (theme: ColorThemeType) => StyleSheet.NamedStyles<T>,
) => {
    const theme = useTheme()
    return { styles: styles(theme), theme }
}
