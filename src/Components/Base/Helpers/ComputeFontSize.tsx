import {Typography} from '~Common'

export const cumputeFontSize = (
    font: string | undefined,
    typography: Typography,
) => {
    if (font === 'largeTitle') {
        return typography.largeTitle.fontSize
    }

    if (font === 'title') {
        return typography.title.fontSize
    }

    if (font === 'subTitle') {
        return typography.subTitle.fontSize
    }

    if (font === 'body') {
        return typography.body.fontSize
    }

    if (font === 'footnote') {
        return typography.footnote.fontSize
    }

    if (font === 'caption') {
        return typography.caption.fontSize
    }

    return typography.body.fontSize
}
