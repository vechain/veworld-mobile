import { StyleSheet } from "react-native"
import { ThemeType } from "~Model"
import { Theme } from "../Theme/Theme"
import { useUserPreferencesEntity } from "./Entities"

export const useTheme = (): ThemeType => {
    const userPreferences = useUserPreferencesEntity()
    const theme = Theme(userPreferences.theme)
    return theme
}

export const useThemedStyles = <T,>(
    styles: (theme: ThemeType) => StyleSheet.NamedStyles<T>,
) => {
    const theme = useTheme()
    return styles(theme)
}
