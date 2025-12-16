import { ethers } from "ethers"
import { useMemo } from "react"
import { CURRENCY_FORMATS } from "~Constants"
import { getNumberFormatter } from "~Constants/Constants/NumberFormatter"
import { useFormatFiat } from "~Hooks"
import { FungibleToken } from "~Model"
import { selectCurrencyFormat, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { getDecimalSeparator } from "~Utils/BigNumberUtils/BigNumberUtils"
import { truncateToMaxDecimals } from "./useSendAmountInput"

type Args = {
    input: string
    tokenAmount: string
    fiatAmount: string
    isInputInFiat: boolean
    token: FungibleToken
}

export const useDisplayInput = ({ input, tokenAmount, fiatAmount, isInputInFiat, token }: Args) => {
    const { formatLocale } = useFormatFiat()

    const currencyFormat = useAppSelector(selectCurrencyFormat)

    const { locale, decimalSeparator } = useMemo(() => {
        switch (currencyFormat) {
            case CURRENCY_FORMATS.COMMA:
                return { locale: "de-DE", decimalSeparator: CURRENCY_FORMATS.COMMA }
            case CURRENCY_FORMATS.DOT:
                return { locale: "en-US", decimalSeparator: CURRENCY_FORMATS.DOT }
            case CURRENCY_FORMATS.SYSTEM:
            default:
                return {
                    locale: formatLocale,
                    decimalSeparator: getDecimalSeparator(formatLocale) ?? CURRENCY_FORMATS.DOT,
                }
        }
    }, [currencyFormat, formatLocale])

    const formatter = useMemo(
        () =>
            getNumberFormatter({
                locale,
                useGrouping: true,
                precision: 0,
                style: "decimal",
            }),
        [locale],
    )

    const formattedInput = useMemo(() => {
        const [integerPart, decimalPart] = truncateToMaxDecimals(
            input,
            isInputInFiat ? { kind: "fiat" } : { kind: "token", decimals: token.decimals },
        ).split(/[.,]/)

        const formattedInteger = formatter.format(Number(integerPart))

        if (decimalPart !== undefined) {
            return `${formattedInteger}${decimalSeparator}${decimalPart}`
        }

        return formattedInteger
    }, [input, isInputInFiat, token.decimals, formatter, decimalSeparator])

    const formattedConverted = useMemo(() => {
        const valueToFormat = isInputInFiat ? tokenAmount : fiatAmount
        const [integerPart, decimalPart] = truncateToMaxDecimals(
            ethers.utils.formatUnits(valueToFormat, token.decimals),
            // Always use 2 decimals for converted value
            { kind: "fiat" },
        ).split(/[.,]/)

        const formattedInteger = formatter.format(Number(integerPart))

        if (!BigNutils(decimalPart).isZero) {
            return `${formattedInteger}${decimalSeparator}${decimalPart}`
        }

        return formattedInteger
    }, [isInputInFiat, tokenAmount, fiatAmount, token, formatter, decimalSeparator])

    return useMemo(() => ({ formattedInput, formattedConverted }), [formattedConverted, formattedInput])
}
