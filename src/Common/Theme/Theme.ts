import {ThemeType} from './Types'

export const Theme: ThemeType = {
    constants: {
        transparent: 'transparent',
    },

    typography: {
        largeTitle: {
            fontSize: 34,
        },
        title: {
            fontSize: 28,
        },
        subTitle: {
            fontSize: 22,
            fontWeight: '600',
        },
        body: {
            fontSize: 17,
        },
        footnote: {
            fontSize: 13,
        },
        caption: {fontSize: 11},
    },

    dark: {
        isDark: true,

        colors: {
            background: 'black',
            text: 'white',
            tabicon: '#b1b1b1',
            tabiconInactive: '#595959',
            button: '#7e3ab9',
        },
    },
    light: {
        isDark: false,

        colors: {
            background: 'white',
            text: 'black',
            tabicon: 'black',
            tabiconInactive: '#595959',
            button: '#b66aca',
        },
    },
}
