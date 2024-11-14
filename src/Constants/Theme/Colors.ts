export type Colors = {
    primary: string
    primaryLight: string
    primaryReversed: string
    primaryDisabled: string
    neutralDisabled: string
    secondary: string
    tertiary: string
    disabled: string
    disabledButton: string
    danger: string
    success: string
    successMedium: string
    info: string
    warning: string
    error: string
    text: string
    textDisabled: string
    textReversed: string
    alertDescription: string
    background: string
    backgroundReversed: string
    backgroundTransparent: string
    splashBackground: string
    splashColorLayer: string
    card: string
    border: string
    notification: string
    transparent: string
    separator: string
    switcher: string
    skeletonBoneColor: string
    skeletonHighlightColor: string
    alertOrangeMedium: string
    alertRedMedium: string
    placeholder: string
    testnetBackground: string
    gradientBackground: string[]
    horizontalButtonSelected: string
    horizontalButtonText: string
    horizontalButtonTextReversed: string
    cardBorder: string
    switchEnabled: string
    textLight: string
    checkboxFilledBackground: string
    checkboxIcon: string
    passwordPlaceholder: string
    successVariant: {
        background: string
        border: string
        borderLight: string
        icon: string
        title: string
        titleInline: string
    }
    errorVariant: {
        background: string
        border: string
        icon: string
        title: string
        titleInline: string
    }
    neutralVariant: {
        background: string
        border: string
        icon: string
        title: string
        titleInline: string
    }
    infoVariant: {
        background: string
        border: string
        icon: string
        title: string
        titleInline: string
    }
}

export enum COLORS {
    TRANSPARENT = "transparent",
    WHITE = "#FFFFFF",
    WHITE_DISABLED = "rgba(255, 255, 255, 0.7)",
    GRAY = "#A6A6A6",
    LIGHT_GRAY = "#f2f2f7",
    LIGHT_GRAY_TRANSPARENT = "rgba(250, 250, 250, 0.0)",
    LIME_GREEN = "#E2F895",
    LIME_GREEN_LIGHT = "#E6F5B2",
    LIME_GREEN_DISABLED = "#B7C685",
    LIME_GREEN_TRANSPARENT = "rgba(226, 248, 149, 0.25)",
    DARK_PURPLE = "#0B0043",
    DARK_PURPLE_TRANSPARENT = "rgba(11, 0, 67, 0.0)",
    PURPLE_BLUR_TRANSPARENT = "rgba(11, 0, 67, 0.25)",
    DARK_PURPLE_RBGA = "rgba(11, 0, 67, 0.7)",
    PURPLE = "#30265F",
    LIGHT_PURPLE = "#55498c",
    PURPLE_DISABLED = "#261E4C",
    DARK_PURPLE_DISABLED = "#59527F",
    LIGHT_RED = "#FFC7B3",
    PASTEL_RED = "#f7c4bc",
    DARK_RED = "#931536",
    DARK_RED_ALERT = "#9D1800",
    MEDIUM_RED = "#E02200",
    RED_700 = "#9B2C2C",
    RED_600 = "#C53030",
    RED_500 = "#E53E3E",
    RED_400 = "#F56565",
    RED_200 = "#FEB2B2",
    RED_100 = "#FED7D7",
    RED_50 = "#FFF5F5",
    DARK_GREEN = "#325B00",
    DARK_GREEN_ALERT = "#185927",
    LIGHT_BLUE = "#90CDF4",
    MEDIUM_BLUE = "#3182CE",
    PASTEL_BLUE = "#4299E1",
    DARK_BLUE_ALERT = "#2C5282",
    BLUE_700 = "#2C5282",
    BLUE_500 = "#3182CE",
    BLUE_400 = "#4299E1",
    BLUE_200 = "#90CDF4",
    BLUE_100 = "#BEE3F8",
    BLUE_50 = "#EBF8FF",
    LIGHT_GREEN = "#AAD836",
    PASTEL_GREEN = "#c5eacd",
    MEDIUM_GREEN = "#30B34E",
    GREEN_700 = "#276749",
    GREEN_500 = "#38A169",
    GREEN_200 = "#9AE6B4",
    GREEN_100 = "#C6F6D5",
    GREEN_50 = "#F0FFF4",
    PASTEL_ORANGE = "#fedbc0",
    DARK_ORANGE_ALERT = "#AF4F0A",
    MEDIUM_ORANGE = "#FA710E",
    DISABLED_GREY = "#E5E5E5",
    MEDIUM_GRAY = "#C4C4C4",
    GREY_700 = "#363A3F",
    GREY_600 = "#4A5568",
    GREY_500 = "#718096",
    GREY_400 = "#AAAFB6",
    GREY_300 = "#CBD5E0",
    GREY_200 = "#E2E8F0",
    GREY_100 = "#EDF2F7",
    GREY_50 = "#F9F9FA",
    COINBASE_BACKGROUND_LIGHT = "#ffffff",
    COINBASE_BACKGROUND_DARK = "#0a0b0d",
    COINBASE_BACKGROUND_BLUE = "#0052FF",
    TESTNET_BACKGROUND_LIGHT = "rgba(243, 193, 27, 1)",
    TESTNET_BACKGROUND_DARK = "#FF9900",
    GRADIENT_BACKGROUND_LIGHT_TOP = "rgba(128, 128, 128, 0.7)",
    GRADIENT_BACKGROUND_LIGHT_BOTTOM = "rgba(93, 93, 93, 0.95)",
    GRADIENT_BACKGROUND_DARK_TOP = "rgba(11, 0, 67, 0.7)",
    GRADIENT_BACKGROUND_DARK_BOTTOM = "rgba(11, 0, 67, 0.95)",
}

const light: Colors = {
    primary: COLORS.DARK_PURPLE,
    primaryLight: COLORS.PURPLE,
    primaryReversed: COLORS.LIME_GREEN,
    primaryDisabled: COLORS.GRAY,
    neutralDisabled: COLORS.WHITE_DISABLED,
    secondary: COLORS.LIME_GREEN,
    tertiary: COLORS.LIME_GREEN,
    disabled: COLORS.WHITE_DISABLED,
    disabledButton: COLORS.PURPLE_BLUR_TRANSPARENT,
    danger: COLORS.DARK_RED,
    success: COLORS.DARK_GREEN,
    successMedium: COLORS.WHITE,
    info: COLORS.WHITE,
    warning: COLORS.WHITE,
    error: COLORS.WHITE,
    text: COLORS.DARK_PURPLE,
    textDisabled: COLORS.DARK_PURPLE_DISABLED,
    textReversed: COLORS.WHITE,
    alertDescription: COLORS.GREY_600,
    textLight: COLORS.GREY_500,
    background: COLORS.LIGHT_GRAY,
    backgroundReversed: COLORS.DARK_PURPLE,
    backgroundTransparent: COLORS.LIGHT_GRAY_TRANSPARENT,
    splashColorLayer: COLORS.DARK_PURPLE,
    splashBackground: COLORS.DARK_PURPLE,
    card: COLORS.WHITE,
    cardBorder: COLORS.GREY_300,
    border: COLORS.DARK_PURPLE,
    notification: COLORS.DARK_PURPLE,
    transparent: COLORS.TRANSPARENT,
    separator: COLORS.DARK_PURPLE_RBGA,
    switcher: COLORS.DARK_PURPLE_DISABLED,
    skeletonBoneColor: COLORS.MEDIUM_GRAY,
    skeletonHighlightColor: COLORS.LIGHT_GRAY,
    alertOrangeMedium: COLORS.MEDIUM_ORANGE,
    alertRedMedium: COLORS.MEDIUM_RED,
    placeholder: COLORS.DISABLED_GREY,
    testnetBackground: COLORS.TESTNET_BACKGROUND_LIGHT,
    gradientBackground: [COLORS.GRADIENT_BACKGROUND_LIGHT_TOP, COLORS.GRADIENT_BACKGROUND_LIGHT_BOTTOM],
    horizontalButtonSelected: COLORS.DARK_PURPLE,
    horizontalButtonText: COLORS.WHITE,
    horizontalButtonTextReversed: COLORS.DARK_PURPLE,
    switchEnabled: COLORS.LIGHT_GREEN,
    checkboxFilledBackground: COLORS.DARK_PURPLE,
    checkboxIcon: COLORS.WHITE,
    passwordPlaceholder: COLORS.GREY_400,
    successVariant: {
        background: COLORS.GREEN_50,
        border: COLORS.GREEN_200,
        borderLight: COLORS.GREEN_100,
        icon: COLORS.GREEN_500,
        title: COLORS.GREEN_700,
        titleInline: COLORS.GREEN_700,
    },
    errorVariant: {
        background: COLORS.RED_50,
        border: COLORS.RED_200,
        icon: COLORS.RED_500,
        title: COLORS.RED_700,
        titleInline: COLORS.RED_700,
    },
    neutralVariant: {
        background: COLORS.GREY_50,
        border: COLORS.GREY_200,
        icon: COLORS.GREY_500,
        title: COLORS.GREY_700,
        titleInline: COLORS.GREY_700,
    },
    infoVariant: {
        background: COLORS.BLUE_50,
        border: COLORS.BLUE_200,
        icon: COLORS.BLUE_500,
        title: COLORS.BLUE_700,
        titleInline: COLORS.BLUE_700,
    },
}

const dark: Colors = {
    primary: COLORS.LIME_GREEN,
    primaryLight: COLORS.LIME_GREEN_LIGHT,
    primaryReversed: COLORS.DARK_PURPLE,
    primaryDisabled: COLORS.PURPLE_DISABLED,
    neutralDisabled: COLORS.PURPLE_DISABLED,
    secondary: COLORS.LIME_GREEN,
    tertiary: COLORS.DARK_PURPLE,
    disabled: COLORS.WHITE_DISABLED,
    disabledButton: COLORS.LIME_GREEN_TRANSPARENT,
    danger: COLORS.LIGHT_RED,
    success: COLORS.LIGHT_GREEN,
    successMedium: COLORS.MEDIUM_GREEN,
    info: COLORS.DARK_PURPLE,
    warning: COLORS.MEDIUM_ORANGE,
    error: COLORS.MEDIUM_RED,
    text: COLORS.WHITE,
    textDisabled: COLORS.WHITE_DISABLED,
    textReversed: COLORS.DARK_PURPLE,
    alertDescription: COLORS.GREY_600,
    textLight: COLORS.WHITE,
    background: COLORS.DARK_PURPLE,
    backgroundReversed: COLORS.GRAY,
    backgroundTransparent: COLORS.DARK_PURPLE_TRANSPARENT,
    splashColorLayer: COLORS.LIME_GREEN,
    splashBackground: COLORS.DARK_PURPLE,
    card: COLORS.PURPLE,
    cardBorder: COLORS.DARK_PURPLE,
    border: COLORS.WHITE,
    notification: COLORS.WHITE,
    transparent: COLORS.TRANSPARENT,
    separator: COLORS.WHITE_DISABLED,
    switcher: COLORS.DARK_PURPLE_DISABLED,
    skeletonBoneColor: COLORS.PURPLE,
    skeletonHighlightColor: COLORS.LIGHT_PURPLE,
    alertOrangeMedium: COLORS.PASTEL_ORANGE,
    alertRedMedium: COLORS.PASTEL_RED,
    placeholder: COLORS.PURPLE,
    testnetBackground: COLORS.TESTNET_BACKGROUND_DARK,
    gradientBackground: [COLORS.GRADIENT_BACKGROUND_DARK_TOP, COLORS.GRADIENT_BACKGROUND_DARK_BOTTOM],
    horizontalButtonSelected: COLORS.DARK_PURPLE,
    horizontalButtonText: COLORS.WHITE,
    horizontalButtonTextReversed: COLORS.WHITE,
    switchEnabled: COLORS.LIGHT_GREEN,
    checkboxFilledBackground: COLORS.WHITE,
    checkboxIcon: COLORS.DARK_PURPLE,
    passwordPlaceholder: COLORS.GREY_400,
    successVariant: {
        background: COLORS.GREEN_100,
        border: COLORS.GREEN_200,
        borderLight: COLORS.GREEN_200,
        icon: COLORS.GREEN_500,
        title: COLORS.GREEN_700,
        titleInline: COLORS.GREEN_200,
    },
    errorVariant: {
        background: COLORS.RED_100,
        border: COLORS.RED_200,
        icon: COLORS.RED_500,
        title: COLORS.RED_700,
        titleInline: COLORS.RED_200,
    },
    neutralVariant: {
        background: COLORS.GREY_100,
        border: COLORS.GREY_300,
        icon: COLORS.GREY_500,
        title: COLORS.GREY_700,
        titleInline: COLORS.GREY_200,
    },
    infoVariant: {
        background: COLORS.BLUE_100,
        border: COLORS.BLUE_200,
        icon: COLORS.BLUE_500,
        title: COLORS.BLUE_700,
        titleInline: COLORS.BLUE_200,
    },
}

export const colors = { light, dark }
