export type TFonts =
    | "largeTitle"
    | "title"
    | "subTitle"
    | "body"
    | "footNote"
    | "caption"
    | "largeTitleAccent"
    | "titleAccent"
    | "subTitleAccent"
    | "bodyAccent"
    | "footNoteAccent"
    | "captionAccent"

const fontFamily = {
    "Inter-Bold": "Inter-Bold",
    "Inter-Regular": "Inter-Regular",
    "Inter-Light": "Inter-Light",
    "Inter-Medium": "Inter-Medium",
    "Mono-Extra-Bold": "Mono-Extra-Bold",
    "Mono-Bold": "Mono-Bold",
    "Mono-Regular": "Mono-Regular",
    "Mono-Light": "Mono-Light",
}

const fontWeight = {
    normal: "normal",
    bold: "bold",
    "100": "100",
    "200": "200",
    "300": "300",
    "400": "400",
    "500": "500",
    "600": "600",
    "700": "700",
    "800": "800",
    "900": "900",
}

const fontSize = {
    10: 10,
    12: 12,
    14: 14,
    16: 16,
    18: 18,
    20: 20,
    22: 22,
    24: 24,
    28: 28,
}

export type TypographyObject = {
    fontFamily: (typeof fontFamily)[keyof typeof fontFamily]
    fontSize: (typeof fontSize)[keyof typeof fontSize]
    fontWeight: (typeof fontWeight)[keyof typeof fontWeight]
}

export const defaults: Record<TFonts, TypographyObject> = {
    // INTER
    largeTitle: {
        fontFamily: "Inter-Regular",
        fontSize: 32,
        fontWeight: fontWeight.normal,
    },
    title: {
        fontFamily: fontFamily["Inter-Regular"],
        fontSize: fontSize[28],
        fontWeight: fontWeight.normal,
    },
    subTitle: {
        fontFamily: "Inter-Bold",
        fontSize: 22,
        fontWeight: fontWeight.normal,
    },
    body: {
        fontFamily: "Inter-Regular",
        fontSize: 16,
        fontWeight: fontWeight.normal,
    },
    footNote: {
        fontFamily: "Inter-Light",
        fontSize: 13,
        fontWeight: fontWeight.normal,
    },
    caption: {
        fontFamily: "Inter-Light",
        fontSize: 11,
        fontWeight: fontWeight.normal,
    },

    // MONO
    largeTitleAccent: {
        fontFamily: "Mono-Extra-Bold",
        fontSize: 32,
        fontWeight: fontWeight.normal,
    },
    titleAccent: {
        fontFamily: "Mono_Bold",
        fontSize: 28,
        fontWeight: fontWeight.normal,
    },
    subTitleAccent: {
        fontFamily: "Mono_Bold",
        fontSize: 22,
        fontWeight: fontWeight.normal,
    },
    bodyAccent: {
        fontFamily: "Mono-Regular",
        fontSize: 16,
        fontWeight: fontWeight.normal,
    },
    footNoteAccent: {
        fontFamily: "Mono-Light",
        fontSize: 13,
        fontWeight: fontWeight.normal,
    },
    captionAccent: {
        fontFamily: "Mono-Light",
        fontSize: 11,
        fontWeight: fontWeight.normal,
    },
}

export const typography = { defaults, fontSize, fontWeight, fontFamily }
