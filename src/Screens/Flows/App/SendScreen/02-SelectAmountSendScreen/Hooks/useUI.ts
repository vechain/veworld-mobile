import { useMemo } from "react"
import {
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { COLORS, CURRENCY, ColorThemeType } from "~Constants"
import { FungibleTokenWithBalance } from "~Model"

export const useUI = ({
    token,
    isError,
    theme,
    input,
    isInputInFiat,
    tokenHumanAmountFromFiat,
    fiatHumanAmount,
    currency,
}: {
    token: FungibleTokenWithBalance
    isError: boolean
    theme: ColorThemeType
    input: string
    isInputInFiat: boolean
    tokenHumanAmountFromFiat: string
    fiatHumanAmount: string
    currency: CURRENCY
}) => {
    const inputColorNotAnimated = isError ? theme.colors.danger : theme.colors.text

    const colorProgress = useDerivedValue(() => {
        return withTiming(isError ? 1 : 0, {
            duration: 100,
        })
    })

    const animatedStyleInputColor = useAnimatedStyle(() => {
        let color = interpolateColor(colorProgress.value, [0, 1], [theme.colors.text, theme.colors.danger])

        return {
            color,
        }
    }, [isError, theme.isDark])

    const placeholderColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

    const shortenedTokenName = useMemo(() => {
        return token.name.length > 30 ? `${token.name.slice(0, 29)}...` : token.name
    }, [token.name])

    const inputTextSize = useSharedValue(38)

    const animatedFontStyle = useAnimatedStyle(() => {
        return {
            fontSize: inputTextSize.value,
        }
    }, [])

    const computeFonts = useMemo(() => {
        return input.length > 11
            ? (inputTextSize.value = withSpring(24, {
                  damping: 14,
                  stiffness: 100,
              }))
            : (inputTextSize.value = withSpring(38, {
                  damping: 14,
                  stiffness: 100,
              }))
    }, [input.length, inputTextSize])

    const computeconvertedAmountInFooter = useMemo(() => {
        if (isInputInFiat) {
            if (tokenHumanAmountFromFiat.includes("<")) {
                return `${tokenHumanAmountFromFiat} ${token.symbol}`
            } else {
                return `≈ ${tokenHumanAmountFromFiat} ${token.symbol}`
            }
        } else {
            if (fiatHumanAmount.includes("<")) {
                return `${fiatHumanAmount} ${currency}`
            } else {
                return `≈ ${fiatHumanAmount} ${currency}`
            }
        }
    }, [currency, fiatHumanAmount, isInputInFiat, token.symbol, tokenHumanAmountFromFiat])

    return {
        placeholderColor,
        shortenedTokenName,
        computeFonts,
        animatedFontStyle,
        animatedStyleInputColor,
        inputColorNotAnimated,
        computeconvertedAmountInFooter,
    }
}
