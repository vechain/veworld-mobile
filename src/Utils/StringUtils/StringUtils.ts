export const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function truncateTextIfSizeIsGreaterThan(maximumSize: number, text: string) {
    return text.length > maximumSize ? text.slice(0, maximumSize).trim() + "..." : text
}

export const toUppercase = <TText extends string>(text: TText): Uppercase<TText> =>
    text.toUpperCase() as Uppercase<TText>
