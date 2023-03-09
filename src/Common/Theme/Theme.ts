import { Colors, colors } from "./Colors"
import { radius } from "./Radius"
import { shadows } from "./Shadows"
import { spacing } from "./Spacing"
import { typography } from "./Typography"

export * from "./StyleProps"
export type ColorThemeType = {
    isDark: boolean
    colors: Colors
    shadows: (typeof shadows)["dark"] | (typeof shadows)["light"]
}

export const ColorTheme = (type: "light" | "dark"): ColorThemeType => ({
    isDark: type === "dark",
    shadows: shadows[type],
    colors: colors[type],
})

type ThemeType = {
    typography: typeof typography
    radius: typeof radius
    spacing: typeof spacing
}
export const Theme: ThemeType = {
    typography,
    radius,
    spacing,
}
