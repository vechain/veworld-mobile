import { ThemeVariant } from "~Model"

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

const light: ThemeVariant = {
    isDark: false,
    colors: {
        primary: Colors.DARK_PURPLE,
        primaryDisabled: Colors.PURPLE_DISABLED,
        secondary: Colors.LIME_GREEN,
        tertiary: Colors.LIME_GREEN,
        disabled: Colors.WHITE_DISABLED,
        danger: Colors.DARK_RED,
        success: Colors.DARK_GREEN,
        text: Colors.DARK_PURPLE,
        background: Colors.GRAY,
        backgroundReversed: Colors.DARK_PURPLE,
        card: Colors.WHITE,
        border: Colors.DARK_PURPLE,
        notification: Colors.DARK_PURPLE,
    },
}

const dark: ThemeVariant = {
    isDark: true,
    colors: {
        primary: Colors.LIME_GREEN,
        primaryDisabled: Colors.LIME_GREEN_DISABLED,
        secondary: Colors.LIME_GREEN,
        tertiary: Colors.DARK_PURPLE,
        disabled: Colors.WHITE_DISABLED,
        danger: Colors.LIGHT_RED,
        success: Colors.LIGHT_GREEN,
        text: Colors.WHITE,
        background: Colors.DARK_PURPLE,
        backgroundReversed: Colors.GRAY,
        card: Colors.PURPLE,
        border: Colors.WHITE,
        notification: Colors.WHITE,
    },
}

export const colors = { light, dark }
