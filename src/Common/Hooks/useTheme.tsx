import { Theme } from "../Theme/Theme"
import { useColorScheme } from "./useColorScheme"

export const useTheme = () => {
    const colorScheme = useColorScheme()
    const theme = Theme[colorScheme]
    const constants = Theme.constants
    const typography = Theme.typography
    return { ...theme, constants, typography }
}
