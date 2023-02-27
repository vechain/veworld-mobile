export type TFonts =
    | "large_title"
    | "title"
    | "sub_title"
    | "body"
    | "footnote"
    | "caption"
    | "large_title_accent"
    | "title_accent"
    | "sub_title_accent"
    | "body_accent"
    | "footnote_accent"
    | "caption_accent"

export type TBaseFontStyle = {
    fontFamily: string
    fontSize: number
}

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
}

export type Shadows = {
    card: Object
    bottom: Object
}

export type ThemeVariant = {
    isDark: boolean
    colors: Colors
}

export type Constants = {
    transparent: "transparent"
    bgDark: string
    bgLght: string
    lightGrey: string
}

export type Typography = {
    large_title: TBaseFontStyle
    title: TBaseFontStyle
    sub_title: TBaseFontStyle
    body: TBaseFontStyle
    caption: TBaseFontStyle
    footnote: TBaseFontStyle
    large_title_accent: TBaseFontStyle
    title_accent: TBaseFontStyle
    sub_title_accent: TBaseFontStyle
    body_accent: TBaseFontStyle
    caption_accent: TBaseFontStyle
    footnote_accent: TBaseFontStyle
}

export type ThemeType = {
    constants: Constants
    typography: Typography
    colors: {
        dark: ThemeVariant
        light: ThemeVariant
    }
    shadows: {
        dark: Shadows
        light: Shadows
    }
}

export type useThemeType = {
    constants: Constants
    typography: Typography
    colors: Colors
    shadows: Shadows
}
