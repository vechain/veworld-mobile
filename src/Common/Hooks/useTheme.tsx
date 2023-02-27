import { useThemeType } from "~Model"
import { Theme } from "../Theme/Theme"
import { useUserPreferencesEntity } from "./Entities"

export const useTheme = (): useThemeType => {
    const userPreferences = useUserPreferencesEntity()
    const colorsTheme = Theme.colors[userPreferences.theme]
    const shadowsTheme = Theme.shadows[userPreferences.theme]
    const constants = Theme.constants
    const typography = Theme.typography
    return { ...colorsTheme, shadows: shadowsTheme, constants, typography }
}

export const useThemedStyles = (styles: (theme: useThemeType) => any) => {
    const theme = useTheme()
    return styles(theme)
}
