import { useMemo } from "react"
import { BigNutils } from "~Utils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"

type UseAmountConversionProps = {
    input: string
    exchangeRate?: number
    isInputInFiat: boolean
    tokenDecimals: number
    tokenTotalBalance: string
    formatLocale: string
}

type UseAmountConversionResult = {
    normalizedInput: string
    tokenAmount: string
    fiatAmount: string
    formattedConvertedAmount: string
    isBalanceExceeded: boolean
    isValidAmount: boolean
    fiatTotalBalance: { value: string; isLeesThan_0_01: boolean; preciseValue: string }
    tokenTotalToHuman: ReturnType<typeof BigNutils>
}

/**
 * Hook to handle conversion between fiat and token amounts for user input
 * Centralizes all conversion logic for the send amount screen
 */
export const useAmountConversion = ({
    input,
    exchangeRate,
    isInputInFiat,
    tokenDecimals,
    tokenTotalBalance,
    formatLocale,
}: UseAmountConversionProps): UseAmountConversionResult => {
    const normalizedInput = useMemo(() => {
        return /^[.,]/.exec(input) ? `0${input}` : input
    }, [input])

    const tokenTotalToHuman = useMemo(() => {
        return BigNutils(tokenTotalBalance).toHuman(tokenDecimals)
    }, [tokenTotalBalance, tokenDecimals])

    const fiatTotalBalance = useMemo(
        () => BigNutils().toCurrencyConversion(tokenTotalToHuman.toString, exchangeRate ?? 0),
        [exchangeRate, tokenTotalToHuman],
    )

    const fiatHumanAmount = useMemo(
        () => BigNutils().toCurrencyConversion(normalizedInput, exchangeRate ?? 0),
        [exchangeRate, normalizedInput],
    )

    const tokenAmount = useMemo(() => {
        if (!input || input === "0") return "0"

        if (isInputInFiat) {
            return BigNutils().toTokenConversion(normalizedInput, exchangeRate ?? 0).toString
        }
        return BigNutils(normalizedInput).addTrailingZeros(tokenDecimals).toHuman(tokenDecimals).toString
    }, [normalizedInput, isInputInFiat, exchangeRate, tokenDecimals, input])

    const fiatAmount = useMemo(() => {
        if (!input || input === "0") return "0"

        if (isInputInFiat) {
            return normalizedInput
        }
        return fiatHumanAmount.value
    }, [normalizedInput, isInputInFiat, fiatHumanAmount.value, input])

    const formattedConvertedAmount = useMemo(() => {
        if (!input || input === "0") return "0"

        if (isInputInFiat) {
            const tokenAmountValue = BigNutils().toTokenConversion(normalizedInput, exchangeRate ?? 0).toString
            return formatFullPrecision(tokenAmountValue, {
                locale: formatLocale,
            })
        } else {
            return formatFullPrecision(fiatHumanAmount.value, {
                locale: formatLocale,
            })
        }
    }, [exchangeRate, fiatHumanAmount.value, formatLocale, input, isInputInFiat, normalizedInput])

    const isBalanceExceeded = useMemo(() => {
        if (!input || input === "0") return false

        const controlValue = isInputInFiat
            ? BigNutils().toTokenConversion(normalizedInput, exchangeRate ?? 0)
            : BigNutils(normalizedInput).addTrailingZeros(tokenDecimals).toHuman(tokenDecimals)

        const balanceToHuman = BigNutils(tokenTotalBalance).toHuman(tokenDecimals)

        return controlValue.isBiggerThan(balanceToHuman.toString)
    }, [input, isInputInFiat, normalizedInput, exchangeRate, tokenDecimals, tokenTotalBalance])

    const isValidAmount = useMemo(() => {
        return input !== "" && !BigNutils(normalizedInput).isZero
    }, [input, normalizedInput])

    return {
        normalizedInput,
        tokenAmount,
        fiatAmount,
        formattedConvertedAmount,
        isBalanceExceeded,
        isValidAmount,
        fiatTotalBalance,
        tokenTotalToHuman,
    }
}
