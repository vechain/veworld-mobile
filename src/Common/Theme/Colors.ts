export type Colors = {
    primary: string
    primaryDisabled: string
    secondary: string
    tertiary: string
    disabled: string
    danger: string
    success: string
    text: string
    background: string
    backgroundReversed: string
    card: string
    border: string
    notification: string
    transparent: string
}

enum COLORS {
    TRANSPARENT = "transparent",
    WHITE = "#FFFFFF",
    WHITE_DISABLED = "#E5E5E5",
    GRAY = "#A6A6A6",
    LIGHT_GRAY = "#FAFAFA",
    LIME_GREEN = "#E2F895",
    LIME_GREEN_DISABLED = "#B7C685",
    DARK_PURPLE = "#0B0043",
    PURPLE = "#30265F",
    PURPLE_DISABLED = "#261E4C",
    LIGHT_RED = "#FFC7B3",
    DARK_RED = "#931536",
    DARK_GREEN = "#325B00",
    LIGHT_GREEN = "#AAD836",
}

const light: Colors = {
    primary: COLORS.DARK_PURPLE,
    primaryDisabled: COLORS.PURPLE_DISABLED,
    secondary: COLORS.LIME_GREEN,
    tertiary: COLORS.LIME_GREEN,
    disabled: COLORS.WHITE_DISABLED,
    danger: COLORS.DARK_RED,
    success: COLORS.DARK_GREEN,
    text: COLORS.DARK_PURPLE,
    background: COLORS.LIGHT_GRAY,
    backgroundReversed: COLORS.DARK_PURPLE,
    card: COLORS.WHITE,
    border: COLORS.DARK_PURPLE,
    notification: COLORS.DARK_PURPLE,
    transparent: COLORS.TRANSPARENT,
}

const dark: Colors = {
    primary: COLORS.LIME_GREEN,
    primaryDisabled: COLORS.LIME_GREEN_DISABLED,
    secondary: COLORS.LIME_GREEN,
    tertiary: COLORS.DARK_PURPLE,
    disabled: COLORS.WHITE_DISABLED,
    danger: COLORS.LIGHT_RED,
    success: COLORS.LIGHT_GREEN,
    text: COLORS.WHITE,
    background: COLORS.DARK_PURPLE,
    backgroundReversed: COLORS.GRAY,
    card: COLORS.PURPLE,
    border: COLORS.WHITE,
    notification: COLORS.WHITE,
    transparent: COLORS.TRANSPARENT,
}

export const colors = { light, dark }
