import { ThemeType, ThemeVariant } from "~Model"
import { Theme } from "../Theme/Theme"
import { useUserPreferencesEntity } from "./Entities"

export type useThemeType = Omit<ThemeType, "dark" | "light"> & ThemeVariant
export const useTheme = (): useThemeType => {
    const userPreferences = useUserPreferencesEntity()
    const colorsTheme = Theme[userPreferences.theme]
    const constants = Theme.constants
    const typography = Theme.typography
    return { ...colorsTheme, constants, typography }
}

export const useThemedStyles = (styles: (theme: useThemeType) => any) => {
    const theme = useTheme()
    return styles(theme)
}
