import {ThemeType} from './Types'

export const Theme: ThemeType = {
    constants: {
        transparent: 'transparent',
        bgDark: 'black',
        bgLght: 'white',
    },

    typography: {
        // INTER
        large_title: {
            fontFamily: 'Inter-Bold',
            fontSize: 32,
        },
        title: {
            fontFamily: 'Inter-Regular',
            fontSize: 28,
        },
        sub_title: {
            fontFamily: 'Inter-Bold',
            fontSize: 22,
        },
        body: {
            fontFamily: 'Inter-Regular',
            fontSize: 16,
        },
        footnote: {
            fontFamily: 'Inter-Light',
            fontSize: 13,
        },
        caption: {
            fontSize: 11,
            fontFamily: 'Inter-Light',
        },

        // MONO
        large_title_accent: {
            fontFamily: 'Mono-Extra-Bold',
            fontSize: 32,
        },
        title_accent: {
            fontFamily: 'Mono_Bold',
            fontSize: 28,
        },
        sub_title_accent: {
            fontFamily: 'Mono_Bold',
            fontSize: 22,
        },
        body_accent: {
            fontFamily: 'Mono-Regular',
            fontSize: 16,
        },
        footnote_accent: {
            fontFamily: 'Mono-Light',
            fontSize: 13,
        },
        caption_accent: {
            fontSize: 11,
            fontFamily: 'Mono-Light',
        },
    },

    dark: {
        isDark: true,

        colors: {
            background: 'black',
            text: 'white',
            tabicon: '#b1b1b1',
            tabiconInactive: '#595959',
            button: '#270089', // todo.vas -> cahnge with correct colors
        },
    },
    light: {
        isDark: false,

        colors: {
            background: 'white',
            text: 'black',
            tabicon: 'black',
            tabiconInactive: '#595959',
            button: '#270089',
        },
    },
}
