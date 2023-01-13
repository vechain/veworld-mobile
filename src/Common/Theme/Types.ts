import { TBaseFnotStyle } from "~Common/Types"

export type ThemeVariant = {
    isDark: boolean
    colors: {
        background: string
        text: string
        tabicon: string
        tabiconInactive: string
        button: string
    }
}

export type Constants = {
    transparent: "transparent"
    bgDark: string
    bgLght: string
    lightGrey: string
}

export type Typography = {
    large_title: TBaseFnotStyle
    title: TBaseFnotStyle
    sub_title: TBaseFnotStyle
    body: TBaseFnotStyle
    caption: TBaseFnotStyle
    footnote: TBaseFnotStyle
    large_title_accent: TBaseFnotStyle
    title_accent: TBaseFnotStyle
    sub_title_accent: TBaseFnotStyle
    body_accent: TBaseFnotStyle
    caption_accent: TBaseFnotStyle
    footnote_accent: TBaseFnotStyle
}

export type ThemeType = {
    constants: Constants
    typography: Typography
    dark: ThemeVariant
    light: ThemeVariant
}
