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
    disabledInput: string
    danger: string
    success: string
    successMedium: string
    positive: string
    negative: string
    info: string
    warning: string
    error: string
    text: string
    textDisabled: string
    textReversed: string
    textSelected: string
    alertDescription: string
    numberPad: string
    background: string
    backgroundReversed: string
    backgroundTransparent: string
    splashBackground: string
    splashColorLayer: string
    title: string
    subtitle: string
    card: string
    icon: string
    button: string
    pinFilled: string
    pinEmpty: string
    rightIconHeaderBorder: string
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
    testnetText: string
    gradientBackground: string[]
    horizontalButtonSelected: string
    textSecondary: string
    horizontalButtonTextReversed: string
    cardBorder: string
    switchEnabled: string
    textLight: string
    checkboxFilledBackground: string
    checkboxIcon: string
    passwordPlaceholder: string
    blurBackdropBottomSheet: string
    mnemonicCardBackground: string
    mnemonicCardBorder: string
    toggleMnemonicButtonBackground: string
    pressableCardBorder: string
    pressableCardBackground: string
    tokenCardText: string
    graphLine: string
    graphGradient: string
    graphStatsText: string
    accountCard: string
    marketInfoBackground: string
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
        borderLight: string
        icon: string
        title: string
        titleInline: string
    }
    neutralVariant: {
        background: string
        border: string
        borderLight: string
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
    actionBanner: {
        background: string
        border: string
        title: string
        buttonBackground: string
        buttonBorder: string
        buttonText: string
    }
    assetDetailsCard: {
        background: string
        border: string
        title: string
        text: string
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
    GRAPH_GRADIENT_LIGHT = "#2E0C86",
    LIGHT_RED = "#FFC7B3",
    PASTEL_RED = "#f7c4bc",
    DARK_RED = "#931536",
    DARK_RED_ALERT = "#9D1800",
    MEDIUM_RED = "#E02200",
    RED_NEGATIVE = "#E9627B",
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
    BLUE_700 = "#2C5282",
    BLUE_100 = "#BEE3F8",
    BLUE_50 = "#EBF8FF",
    LIGHT_GREEN = "#AAD836",
    PASTEL_GREEN = "#c5eacd",
    MEDIUM_GREEN = "#30B34E",
    GREEN_700 = "#276749",
    GREEN_600 = "#25855A",
    GREEN_500 = "#38A169",
    GREEN_400 = "#48BB78",
    GREEN_200 = "#9AE6B4",
    GREEN_100 = "#C6F6D5",
    GREEN_50 = "#F0FFF4",
    PASTEL_ORANGE = "#fedbc0",
    DARK_ORANGE_ALERT = "#AF4F0A",
    MEDIUM_ORANGE = "#FA710E",
    DISABLED_GREY = "#E5E5E5",
    MEDIUM_GRAY = "#C4C4C4",
    GREY_800 = "#202226",
    GREY_700 = "#363A3F",
    GREY_600 = "#525860",
    GREY_500 = "#747C89",
    GREY_400 = "#AAAFB6",
    GREY_300 = "#D2D5D9",
    GREY_200 = "#E7E9EB",
    GREY_100 = "#F1F2F3",
    GREY_50 = "#F9F9FA",
    ORANGE_50 = "#FFFAF0",
    ORANGE_100 = "#FEEBCB",
    ORANGE_500 = "#DD6B20",
    ORANGE_700 = "#9C4221",
    PRIMARY_50 = "#F9F8FB",
    PRIMARY_100 = "#F0EEFC",
    PRIMARY_200 = "#CCC3F4",
    PRIMARY_300 = "#A897EC",
    PRIMARY_400 = "#836CE4",
    PRIMARY_500 = "#6042DD",
    PRIMARY_600 = "#4324C6",
    PRIMARY_700 = "#351C9B",
    PRIMARY_800 = "#261470",
    PRIMARY_900 = "#170D45",
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
    disabledButton: COLORS.DARK_PURPLE_DISABLED,
    disabledInput: COLORS.WHITE_DISABLED,
    danger: COLORS.RED_400,
    success: COLORS.GREEN_400,
    successMedium: COLORS.WHITE,
    positive: COLORS.GREEN_600,
    negative: COLORS.RED_400,
    info: COLORS.WHITE,
    warning: COLORS.WHITE,
    error: COLORS.WHITE,
    text: COLORS.DARK_PURPLE,
    textDisabled: COLORS.PURPLE_DISABLED,
    textReversed: COLORS.WHITE,
    textSelected: COLORS.PRIMARY_700,
    alertDescription: COLORS.GREY_600,
    numberPad: COLORS.GREY_600,
    textLight: COLORS.GREY_500,
    background: COLORS.LIGHT_GRAY,
    backgroundReversed: COLORS.DARK_PURPLE,
    backgroundTransparent: COLORS.LIGHT_GRAY_TRANSPARENT,
    splashColorLayer: COLORS.DARK_PURPLE,
    splashBackground: COLORS.DARK_PURPLE,
    title: COLORS.PRIMARY_800,
    subtitle: COLORS.GREY_600,
    card: COLORS.WHITE,
    icon: COLORS.PRIMARY_800,
    pinEmpty: COLORS.GREY_400,
    pinFilled: COLORS.PRIMARY_500,
    button: COLORS.DARK_PURPLE,
    rightIconHeaderBorder: COLORS.GREY_200,
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
    testnetBackground: COLORS.PURPLE,
    testnetText: COLORS.LIGHT_GREEN,
    gradientBackground: [COLORS.GRADIENT_BACKGROUND_LIGHT_TOP, COLORS.GRADIENT_BACKGROUND_LIGHT_BOTTOM],
    horizontalButtonSelected: COLORS.DARK_PURPLE,
    textSecondary: COLORS.WHITE,
    horizontalButtonTextReversed: COLORS.DARK_PURPLE,
    switchEnabled: COLORS.LIGHT_GREEN,
    checkboxFilledBackground: COLORS.DARK_PURPLE,
    checkboxIcon: COLORS.WHITE,
    passwordPlaceholder: COLORS.GREY_400,
    blurBackdropBottomSheet: COLORS.PURPLE_BLUR_TRANSPARENT,
    mnemonicCardBackground: COLORS.GREY_100,
    mnemonicCardBorder: COLORS.GREY_300,
    toggleMnemonicButtonBackground: COLORS.GREY_200,
    pressableCardBackground: COLORS.WHITE,
    pressableCardBorder: COLORS.GREY_200,
    tokenCardText: COLORS.GREY_500,
    graphLine: COLORS.PURPLE,
    graphGradient: COLORS.GRAPH_GRADIENT_LIGHT,
    accountCard: COLORS.PURPLE,
    graphStatsText: COLORS.GREY_600,
    marketInfoBackground: COLORS.GREY_200,
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
        borderLight: COLORS.RED_100,
        icon: COLORS.RED_500,
        title: COLORS.RED_700,
        titleInline: COLORS.RED_700,
    },
    neutralVariant: {
        background: COLORS.GREY_50,
        border: COLORS.GREY_200,
        borderLight: COLORS.GREY_200,
        icon: COLORS.GREY_500,
        title: COLORS.GREY_700,
        titleInline: COLORS.GREY_600,
    },
    infoVariant: {
        background: COLORS.BLUE_50,
        border: COLORS.LIGHT_BLUE,
        icon: COLORS.MEDIUM_BLUE,
        title: COLORS.BLUE_700,
        titleInline: COLORS.BLUE_700,
    },
    actionBanner: {
        background: COLORS.PRIMARY_100,
        border: COLORS.PRIMARY_200,
        title: COLORS.PURPLE,
        buttonBackground: COLORS.WHITE,
        buttonBorder: COLORS.GREY_200,
        buttonText: COLORS.PURPLE,
    },
    assetDetailsCard: {
        background: COLORS.GREY_50,
        border: COLORS.GREY_200,
        title: COLORS.GREY_800,
        text: COLORS.GREY_500,
    },
}

const dark: Colors = {
    primary: COLORS.PURPLE,
    primaryLight: COLORS.LIME_GREEN_LIGHT,
    primaryReversed: COLORS.DARK_PURPLE,
    primaryDisabled: COLORS.PURPLE_DISABLED,
    neutralDisabled: COLORS.PURPLE_DISABLED,
    secondary: COLORS.LIME_GREEN,
    tertiary: COLORS.DARK_PURPLE,
    disabled: COLORS.WHITE_DISABLED,
    disabledButton: COLORS.LIME_GREEN_DISABLED,
    disabledInput: COLORS.PURPLE_DISABLED,
    danger: COLORS.RED_400,
    success: COLORS.GREEN_400,
    successMedium: COLORS.MEDIUM_GREEN,
    positive: COLORS.GREEN_400,
    negative: COLORS.RED_400,
    info: COLORS.DARK_PURPLE,
    warning: COLORS.MEDIUM_ORANGE,
    error: COLORS.MEDIUM_RED,
    text: COLORS.WHITE,
    textDisabled: COLORS.WHITE_DISABLED,
    textReversed: COLORS.DARK_PURPLE,
    textSelected: COLORS.PRIMARY_300,
    alertDescription: COLORS.GREY_600,
    numberPad: COLORS.GREY_300,
    textLight: COLORS.WHITE,
    background: COLORS.DARK_PURPLE,
    backgroundReversed: COLORS.GRAY,
    backgroundTransparent: COLORS.DARK_PURPLE_TRANSPARENT,
    splashColorLayer: COLORS.LIME_GREEN,
    splashBackground: COLORS.DARK_PURPLE,
    pinEmpty: COLORS.GREY_500,
    pinFilled: COLORS.PRIMARY_300,
    title: COLORS.WHITE,
    subtitle: COLORS.GREY_300,
    card: COLORS.PURPLE,
    icon: COLORS.WHITE,
    button: COLORS.LIME_GREEN,
    rightIconHeaderBorder: COLORS.TRANSPARENT,
    cardBorder: COLORS.DARK_PURPLE_DISABLED,
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
    testnetBackground: COLORS.PURPLE,
    testnetText: COLORS.LIGHT_GREEN,
    gradientBackground: [COLORS.GRADIENT_BACKGROUND_DARK_TOP, COLORS.GRADIENT_BACKGROUND_DARK_BOTTOM],
    horizontalButtonSelected: COLORS.DARK_PURPLE,
    textSecondary: COLORS.WHITE,
    horizontalButtonTextReversed: COLORS.WHITE,
    switchEnabled: COLORS.LIGHT_GREEN,
    checkboxFilledBackground: COLORS.WHITE,
    checkboxIcon: COLORS.DARK_PURPLE,
    passwordPlaceholder: COLORS.GREY_400,
    blurBackdropBottomSheet: COLORS.PURPLE_BLUR_TRANSPARENT,
    mnemonicCardBackground: COLORS.DARK_PURPLE_DISABLED,
    mnemonicCardBorder: COLORS.DARK_PURPLE,
    toggleMnemonicButtonBackground: COLORS.PURPLE,
    pressableCardBackground: COLORS.PURPLE,
    pressableCardBorder: COLORS.DARK_PURPLE_DISABLED,
    tokenCardText: COLORS.GREY_300,
    graphLine: COLORS.LIME_GREEN,
    graphGradient: COLORS.LIME_GREEN,
    accountCard: COLORS.LIME_GREEN,
    graphStatsText: COLORS.GREY_400,
    marketInfoBackground: COLORS.PURPLE_DISABLED,
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
        borderLight: COLORS.RED_200,
        icon: COLORS.RED_500,
        title: COLORS.RED_700,
        titleInline: COLORS.RED_200,
    },
    neutralVariant: {
        background: COLORS.GREY_200,
        border: COLORS.GREY_300,
        borderLight: COLORS.GREY_300,
        icon: COLORS.GREY_400,
        title: COLORS.GREY_700,
        titleInline: COLORS.GREY_200,
    },
    infoVariant: {
        background: COLORS.BLUE_100,
        border: COLORS.LIGHT_BLUE,
        icon: COLORS.MEDIUM_BLUE,
        title: COLORS.BLUE_700,
        titleInline: COLORS.LIGHT_BLUE,
    },
    actionBanner: {
        background: COLORS.PURPLE,
        border: COLORS.DARK_PURPLE_DISABLED,
        title: COLORS.WHITE,
        buttonBackground: COLORS.DARK_PURPLE_DISABLED,
        buttonBorder: COLORS.TRANSPARENT,
        buttonText: COLORS.GREY_50,
    },
    assetDetailsCard: {
        background: COLORS.PURPLE,
        border: COLORS.PURPLE,
        title: COLORS.WHITE,
        text: COLORS.GREY_300,
    },
}

export const colors = { light, dark }
