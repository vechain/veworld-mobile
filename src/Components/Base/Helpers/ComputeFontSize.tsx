import {TFonts, Typography, Fonts} from '~Common'

export const cumputeFontSize = (
    font: TFonts | undefined,
    typography: Typography,
) => {
    if (font === Fonts.largeTitle) {
        return typography.largeTitle.fontSize
    }

    if (font === Fonts.title) {
        return typography.title.fontSize
    }

    if (font === Fonts.subTitle) {
        return typography.subTitle.fontSize
    }

    if (font === Fonts.body) {
        return typography.body.fontSize
    }

    if (font === Fonts.footnote) {
        return typography.footnote.fontSize
    }

    if (font === Fonts.caption) {
        return typography.caption.fontSize
    }

    return typography.body.fontSize
}
