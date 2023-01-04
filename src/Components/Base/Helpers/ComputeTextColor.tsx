export const computeTextColor = (
    isButton: boolean | undefined,
    color: string | undefined,
    text: string,
    button: string,
) => {
    if (isButton) {
        return button
    }

    if (color) {
        return color
    }

    return text
}
