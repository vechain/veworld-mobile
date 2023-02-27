import { ThemeType } from "~Model"
import { colors } from "./Colors"
import { shadows } from "./Shadows"

export const Theme = (type: "light" | "dark"): ThemeType => ({
    isDark: type === "dark",
    constants: {
        transparent: "transparent",
        bgDark: "black",
        bgLght: "white",
        lightGrey: "#D3D3D3",
    },

    typography: {
        // INTER
        large_title: {
            fontFamily: "Inter-Bold",
            fontSize: 32,
        },
        title: {
            fontFamily: "Inter-Regular",
            fontSize: 28,
        },
        sub_title: {
            fontFamily: "Inter-Bold",
            fontSize: 22,
        },
        body: {
            fontFamily: "Inter-Regular",
            fontSize: 16,
        },
        footnote: {
            fontFamily: "Inter-Light",
            fontSize: 13,
        },
        caption: {
            fontSize: 11,
            fontFamily: "Inter-Light",
        },

        // MONO
        large_title_accent: {
            fontFamily: "Mono-Extra-Bold",
            fontSize: 32,
        },
        title_accent: {
            fontFamily: "Mono_Bold",
            fontSize: 28,
        },
        sub_title_accent: {
            fontFamily: "Mono_Bold",
            fontSize: 22,
        },
        body_accent: {
            fontFamily: "Mono-Regular",
            fontSize: 16,
        },
        footnote_accent: {
            fontFamily: "Mono-Light",
            fontSize: 13,
        },
        caption_accent: {
            fontSize: 11,
            fontFamily: "Mono-Light",
        },
    },
    shadows: shadows[type],
    colors: colors[type],
})
