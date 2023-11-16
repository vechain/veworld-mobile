import { useMemo } from "react"
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated"
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

    const inputTextSize = useSharedValue(38)

    const animatedStyle = useAnimatedStyle(() => {
        return {
            fontSize: inputTextSize.value,
        }
    }, [])

    const computeFonts = useMemo(() => {
        return input.length > 12
            ? (inputTextSize.value = withSpring(24, {
                  damping: 20,
                  stiffness: 100,
              }))
            : (inputTextSize.value = withSpring(38, {
                  damping: 20,
                  stiffness: 100,
              }))
    }, [input.length, inputTextSize])

    return {
        inputColor,
        placeholderColor,
        shortenedTokenName,
        computeFonts,
        animatedStyle,
    }
}
