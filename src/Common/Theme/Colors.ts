enum Colors {
    WHITE = "#FFFFFF",
    WHITE_DISABLED = "#E5E5E5",
    GRAY = "#A6A6A6",
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

type ColorTheme = {
    primary: string
    secondary: string
    secondaryDisabled: string
    tertiary: string
    disabled: string
    danger: string
    success: string
    text: string
    background: string
    box: string
}

const light: ColorTheme = {
    primary: Colors.LIME_GREEN,
    secondary: Colors.DARK_PURPLE,
    secondaryDisabled: Colors.PURPLE_DISABLED,
    tertiary: Colors.LIME_GREEN,
    disabled: Colors.WHITE_DISABLED,
    danger: Colors.DARK_RED,
    success: Colors.DARK_GREEN,
    text: Colors.DARK_PURPLE,
    background: Colors.GRAY,
    box: Colors.WHITE,
}

const dark: ColorTheme = {
    primary: Colors.LIME_GREEN,
    secondary: Colors.LIME_GREEN,
    secondaryDisabled: Colors.LIME_GREEN_DISABLED,
    tertiary: Colors.DARK_PURPLE,
    disabled: Colors.WHITE_DISABLED,
    danger: Colors.LIGHT_RED,
    success: Colors.LIGHT_GREEN,
    text: Colors.WHITE,
    background: Colors.DARK_PURPLE,
    box: Colors.PURPLE,
}

export { Colors, light, dark }
