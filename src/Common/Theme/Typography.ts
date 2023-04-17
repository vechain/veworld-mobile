export type TFonts =
    | "hugeTitle"
    | "biggerTitle"
    | "largeTitle"
    | "title"
    | "subTitleBold"
    | "subTitle"
    | "subTitleLight"
    | "subSubTitle"
    | "body"
    | "bodyBold"
    | "bodyMedium"
    | "button"
    | "buttonPrimary"
    | "buttonSecondary"
    | "smallButtonPrimary"
    | "footNote"
    | "caption"
    | "captionBold"
    | "captionRegular"
    | "captionMedium"
    | "smallCaption"
    | "smallCaptionMedium"
    | "smallCaptionRegular"
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

const lineHeight = {
    title: 28,
    bodyMedium: 20,
    caption: 13,
}

export type TypographyObject = {
    fontFamily: (typeof fontFamily)[keyof typeof fontFamily]
    fontSize: (typeof fontSize)[keyof typeof fontSize]
    fontWeight: (typeof fontWeight)[keyof typeof fontWeight]
    lineHeight?: (typeof lineHeight)[keyof typeof lineHeight]
}

export const defaults: Record<TFonts, TypographyObject> = {
    // INTER
    hugeTitle: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: 40,
        fontWeight: fontWeight[700],
    },
    largeTitle: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: 32,
        fontWeight: fontWeight[700],
    },
    biggerTitle: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: 24,
        fontWeight: fontWeight[700],
    },
    title: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: fontSize[22],
        fontWeight: fontWeight[700],
        lineHeight: lineHeight.title,
    },
    subTitleBold: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: 18,
        fontWeight: fontWeight[700],
    },
    subTitle: {
        fontFamily: fontFamily["Inter-Medium"],
        fontSize: 18,
        fontWeight: fontWeight[500],
    },
    subTitleLight: {
        fontFamily: fontFamily["Inter-Regular"],
        fontSize: 18,
        fontWeight: fontWeight[400],
    },
    subSubTitle: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: 16,
        fontWeight: fontWeight[700],
    },
    button: {
        fontFamily: fontFamily["Inter-Medium"],
        fontSize: 16,
        fontWeight: fontWeight[500],
    },
    body: {
        fontFamily: fontFamily["Inter-Regular"],
        fontSize: 14,
        fontWeight: fontWeight[400],
    },
    bodyBold: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: 14,
        fontWeight: fontWeight[700],
    },
    bodyMedium: {
        fontFamily: fontFamily["Inter-Medium"],
        fontSize: 14,
        fontWeight: fontWeight[500],
        lineHeight: lineHeight.bodyMedium,
    },
    buttonPrimary: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: 14,
        fontWeight: fontWeight[700],
    },
    buttonSecondary: {
        fontFamily: fontFamily["Inter-Regular"],
        fontSize: 14,
        fontWeight: fontWeight[400],
    },
    smallButtonPrimary: {
        fontFamily: fontFamily["Inter-Medium"],
        fontSize: 12,
        fontWeight: fontWeight[500],
    },
    footNote: {
        fontFamily: fontFamily["Inter-Light"],
        fontSize: 13,
        fontWeight: fontWeight.normal,
    },
    captionBold: {
        fontFamily: fontFamily["Inter-Bold"],
        fontSize: 12,
        fontWeight: fontWeight[700],
    },
    captionMedium: {
        fontFamily: fontFamily["Inter-Medium"],
        fontSize: 12,
        fontWeight: fontWeight[500],
    },
    captionRegular: {
        fontFamily: fontFamily["Inter-Regular"],
        fontSize: 12,
        fontWeight: fontWeight[400],
    },
    caption: {
        fontFamily: fontFamily["Inter-Light"],
        fontSize: 12,
        fontWeight: fontWeight.normal,
        lineHeight: lineHeight.caption,
    },
    smallCaption: {
        fontFamily: fontFamily["Inter-Light"],
        fontSize: 10,
        fontWeight: fontWeight.normal,
        lineHeight: lineHeight.caption,
    },
    smallCaptionMedium: {
        fontFamily: fontFamily["Inter-Medium"],
        fontSize: 10,
        fontWeight: fontWeight.normal,
        lineHeight: lineHeight.caption,
    },
    smallCaptionRegular: {
        fontFamily: fontFamily["Inter-Regular"],
        fontSize: 10,
        fontWeight: fontWeight[400],
    },

    // MONO
    largeTitleAccent: {
        fontFamily: fontFamily["Mono-Extra-Bold"],
        fontSize: 32,
        fontWeight: fontWeight.normal,
    },
    titleAccent: {
        fontFamily: fontFamily["Mono-Bold"],
        fontSize: 28,
        fontWeight: fontWeight.normal,
    },
    subTitleAccent: {
        fontFamily: fontFamily["Mono-Bold"],
        fontSize: 22,
        fontWeight: fontWeight.normal,
    },
    bodyAccent: {
        fontFamily: fontFamily["Mono-Regular"],
        fontSize: 16,
        fontWeight: fontWeight.normal,
    },
    footNoteAccent: {
        fontFamily: fontFamily["Mono-Light"],
        fontSize: 13,
        fontWeight: fontWeight.normal,
    },
    captionAccent: {
        fontFamily: fontFamily["Mono-Light"],
        fontSize: 11,
        fontWeight: fontWeight.normal,
    },
}

export const typography = {
    defaults,
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
}
