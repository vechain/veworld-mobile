import { useMemo } from "react"
import { COLORS, ColorThemeType } from "~Constants"
import { FungibleTokenWithBalance } from "~Model"

export const useUI = ({
    token,
    isError,
    theme,
    input,
}: {
    token: FungibleTokenWithBalance
    isError: boolean
    theme: ColorThemeType
    input: string
}) => {
    const inputColor = isError ? theme.colors.danger : theme.colors.text
    const placeholderColor = theme.isDark
        ? COLORS.WHITE_DISABLED
        : COLORS.DARK_PURPLE_DISABLED

    const shortenedTokenName = useMemo(() => {
        return token.name.length > 30
            ? `${token.name.slice(0, 29)}...`
            : token.name
    }, [token.name])

    const computeFonts = useMemo(
        () => (input.length > 7 ? 24 : 32),
        [input.length],
    )

    return { inputColor, placeholderColor, shortenedTokenName, computeFonts }
}
