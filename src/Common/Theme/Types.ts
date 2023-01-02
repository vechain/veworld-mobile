export type ThemeVariant = {
    isDark: boolean
    colors: {
        background: string
        text: string
        tabicon: string
        tabiconInactive: string
    }
}

export type Constants = {
    transparent: 'transparent'
}

export type Typography = {
    largeTitle: {
        fontSize: number
    }
    title: {
        fontSize: number
    }
    subTitle: {
        fontSize: number
        fontWeight:
            | 'normal'
            | 'bold'
            | '100'
            | '200'
            | '300'
            | '400'
            | '500'
            | '600'
            | '700'
            | '800'
            | '900'
    }
    body: {
        fontSize: number
    }
    caption: {
        fontSize: number
    }
    footnote: {
        fontSize: number
    }
}

export type ThemeType = {
    constants: Constants
    typography: Typography
    dark: ThemeVariant
    light: ThemeVariant
}
