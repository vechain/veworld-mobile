import { StyleSheet } from "react-native"
import { ColorThemeType, ColorTheme } from "../Theme/Theme"
import { useAppSelector } from "~Storage/Redux"
import { selectTheme } from "~Storage/Redux/Selectors"

export const useTheme = (): ColorThemeType => {
    const theme = useAppSelector(selectTheme)
    return ColorTheme(theme)
}

export const useThemedStyles = <T,>(
    styles: (theme: ColorThemeType) => StyleSheet.NamedStyles<T>,
) => {
    const theme = useTheme()
    return { styles: styles(theme), theme }
}
