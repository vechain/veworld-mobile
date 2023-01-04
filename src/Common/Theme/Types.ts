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
    transparent: 'transparent'
    bgDark: string
    bgLght: string
}

export type Typography = {
    largeTitle: {
        fontFamily: string
        fontSize: number
    }
    title: {
        fontFamily: string
        fontSize: number
    }
    subTitle: {
        fontFamily: string
        fontSize: number
    }
    body: {
        fontFamily: string
        fontSize: number
    }
    caption: {
        fontFamily: string
        fontSize: number
    }
    footnote: {
        fontFamily: string
        fontSize: number
    }

    largeTitle_accent: {
        fontFamily: string
        fontSize: number
    }
    title_accent: {
        fontFamily: string
        fontSize: number
    }
    subTitle_accent: {
        fontFamily: string
        fontSize: number
    }
    body_accent: {
        fontFamily: string
        fontSize: number
    }
    caption_accent: {
        fontFamily: string
        fontSize: number
    }
    footnote_accent: {
        fontFamily: string
        fontSize: number
    }
}

export type ThemeType = {
    constants: Constants
    typography: Typography
    dark: ThemeVariant
    light: ThemeVariant
}
