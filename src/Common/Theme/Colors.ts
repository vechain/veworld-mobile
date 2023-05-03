export type Colors = {
    primary: string
    primaryLight: string
    primaryReversed: string
    primaryDisabled: string
    neutralDisabled: string
    secondary: string
    tertiary: string
    disabled: string
    danger: string
    success: string
    successMedium: string
    info: string
    warning: string
    error: string
    text: string
    textDisabled: string
    textReversed: string
    background: string
    backgroundReversed: string
    card: string
    border: string
    notification: string
    transparent: string
    separator: string
    switcher: string
}

export enum COLORS {
    TRANSPARENT = "transparent",
    WHITE = "#FFFFFF",
    WHITE_DISABLED = "rgba(255, 255, 255, 0.7)",
    GRAY = "#A6A6A6",
    LIGHT_GRAY = "#FAFAFA",
    LIME_GREEN = "#E2F895",
    LIME_GREEN_LIGHT = "#E6F5B2",
    LIME_GREEN_DISABLED = "#B7C685",
    DARK_PURPLE = "#0B0043",
    DARK_PURPLE_RBGA = "rgba(11, 0, 67, 0.6)",
    PURPLE = "#30265F",
    PURPLE_DISABLED = "#261E4C",
    DARK_PURPLE_DISABLED = "#59527F",
    LIGHT_RED = "#FFC7B3",
    PASTEL_RED = "#f7c4bc",
    DARK_RED = "#931536",
    DARK_RED_ALERT = "#9D1800",
    MEDIUM_RED = "#E02200",
    DARK_GREEN = "#325B00",
    DARK_GREEN_ALERT = "#185927",
    LIGHT_GREEN = "#AAD836",
    PASTEL_GREEN = "#c5eacd",
    MEDIUM_GREEN = "#30B34E",
    PASTEL_ORANGE = "#fedbc0",
    DARK_ORANGE_ALERT = "#AF4F0A",
    MEDIUM_ORANGE = "#FA710E",
}

const light: Colors = {
    primary: COLORS.DARK_PURPLE,
    primaryLight: COLORS.PURPLE,
    primaryReversed: COLORS.LIME_GREEN,
    primaryDisabled: COLORS.PURPLE_DISABLED,
    neutralDisabled: COLORS.WHITE_DISABLED,
    secondary: COLORS.LIME_GREEN,
    tertiary: COLORS.LIME_GREEN,
    disabled: COLORS.WHITE_DISABLED,
    danger: COLORS.DARK_RED,
    success: COLORS.DARK_GREEN,
    successMedium: COLORS.WHITE,
    info: COLORS.WHITE,
    warning: COLORS.WHITE,
    error: COLORS.WHITE,
    text: COLORS.DARK_PURPLE,
    textDisabled: COLORS.DARK_PURPLE_DISABLED,
    textReversed: COLORS.WHITE,
    background: COLORS.LIGHT_GRAY,
    backgroundReversed: COLORS.DARK_PURPLE,
    card: COLORS.WHITE,
    border: COLORS.DARK_PURPLE,
    notification: COLORS.DARK_PURPLE,
    transparent: COLORS.TRANSPARENT,
    separator: COLORS.DARK_PURPLE_RBGA,
    switcher: COLORS.DARK_PURPLE,
}

const dark: Colors = {
    primary: COLORS.LIME_GREEN,
    primaryLight: COLORS.LIME_GREEN_LIGHT,
    primaryReversed: COLORS.DARK_PURPLE,
    primaryDisabled: COLORS.LIME_GREEN_DISABLED,
    neutralDisabled: COLORS.PURPLE_DISABLED,
    secondary: COLORS.LIME_GREEN,
    tertiary: COLORS.DARK_PURPLE,
    disabled: COLORS.WHITE_DISABLED,
    danger: COLORS.LIGHT_RED,
    success: COLORS.LIGHT_GREEN,
    successMedium: COLORS.MEDIUM_GREEN,
    info: COLORS.DARK_PURPLE,
    warning: COLORS.MEDIUM_ORANGE,
    error: COLORS.MEDIUM_RED,
    text: COLORS.WHITE,
    textDisabled: COLORS.WHITE_DISABLED,
    textReversed: COLORS.DARK_PURPLE,
    background: COLORS.DARK_PURPLE,
    backgroundReversed: COLORS.GRAY,
    card: COLORS.PURPLE,
    border: COLORS.WHITE,
    notification: COLORS.WHITE,
    transparent: COLORS.TRANSPARENT,
    separator: COLORS.WHITE_DISABLED,
    switcher: COLORS.DARK_PURPLE_DISABLED,
}

export const colors = { light, dark }
