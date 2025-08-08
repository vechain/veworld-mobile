export const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function truncateTextIfSizeIsGreaterThan(maximumSize: number, text: string) {
    return text.length > maximumSize ? text.slice(0, maximumSize).trim() + "..." : text
}

export const toUppercase = <TText extends string>(text: TText): Uppercase<TText> =>
    text.toUpperCase() as Uppercase<TText>

type CharacterReplace<
    TText extends string,
    OldChar extends string,
    NewChar extends string,
> = TText extends `${infer First extends string}${OldChar}${infer Last extends string}`
    ? `${First}${NewChar}${CharacterReplace<Last, OldChar, NewChar>}`
    : TText

export const replaceCharacter = <TText extends string, OldChar extends string, NewChar extends string>(
    text: TText,
    oldChar: OldChar,
    newChar: NewChar,
): CharacterReplace<TText, OldChar, NewChar> =>
    text.replaceAll(oldChar, newChar) as CharacterReplace<TText, OldChar, NewChar>
