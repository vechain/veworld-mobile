import { useCallback, useMemo } from "react"
import { getLocales } from "react-native-localize"
import { CURRENCY_FORMATS, CURRENCY_SYMBOLS, getNumberFormatter, SYMBOL_POSITIONS } from "~Constants"
import CurrencyConfig from "~Constants/Constants/CurrencyConfig/CurrencyConfig"
import { selectCurrency, selectCurrencyFormat, selectSymbolPosition, useAppSelector } from "~Storage/Redux"
import { formatFiatAmount } from "~Utils/StandardizedFormatting"

type FormatFiatConfig = Pick<Intl.NumberFormatOptions, "maximumFractionDigits" | "minimumFractionDigits"> & {
    useCompactNotation?: boolean
}
export type FormatFiatFuncArgs = {
    amount?: number
    cover?: boolean
    symbolPosition?: SYMBOL_POSITIONS
    /**
     * Amount of decimals to show.
     * @default 2
     */
    decimals?: number
}

export const useFormatFiat = (intlOptions?: FormatFiatConfig) => {
    const { useCompactNotation, ...restIntlOptions } = intlOptions ?? {}
    const c = useAppSelector(selectCurrency)
    const currencyFormat = useAppSelector(selectCurrencyFormat)
    const mainSymbolPosition = useAppSelector(selectSymbolPosition)
    const { currency } = useMemo(
        () => CurrencyConfig.find(config => config.currency === c) || { currency: CurrencyConfig[0].currency },
        [c],
    )
    const symbol = CURRENCY_SYMBOLS[currency]

    const locale = useMemo(() => {
        switch (currencyFormat) {
            case CURRENCY_FORMATS.SYSTEM:
                return getLocales()[0].languageCode
            case CURRENCY_FORMATS.COMMA:
                return "nl-BE"
            case CURRENCY_FORMATS.DOT:
                return "en-US"
            default:
                return getLocales()[0].languageCode
        }
    }, [currencyFormat])

    const renderCoveredBalances = useCallback(
        (symbolPosition: SYMBOL_POSITIONS) => {
            // Format just the numeric part to get the correct length
            const numericFormatted = getNumberFormatter({
                locale,
                style: "decimal",
                useGrouping: true,
                precision: 2,
            }).format(0.01)

            // Replace with dots and add 2 extra (matching old behavior)
            const coveredNumeric = "•".repeat(numericFormatted.length) + "••"

            // Add currency symbol
            return symbolPosition === SYMBOL_POSITIONS.AFTER
                ? `${coveredNumeric} ${symbol}`
                : `${symbol}${coveredNumeric}`
        },
        [locale, symbol],
    )

    const formatFiat = useCallback(
        ({ amount = 0, cover, symbolPosition: _spOverride, decimals = 2 }: FormatFiatFuncArgs) => {
            const symbolPosition = _spOverride ?? mainSymbolPosition

            // If covered, return covered balance
            if (cover) {
                return renderCoveredBalances(symbolPosition)
            }

            // Use the new standardized formatting with forceDecimals: 2
            const isAfter = symbolPosition === SYMBOL_POSITIONS.AFTER
            return formatFiatAmount(amount, symbol, {
                locale,
                symbolPosition: isAfter ? "after" : "before",
                forceDecimals: decimals, // Always show 2 decimals for fiat amounts
                useCompactNotation,
                ...restIntlOptions,
            })
        },
        [mainSymbolPosition, locale, symbol, renderCoveredBalances, useCompactNotation, restIntlOptions],
    )

    const formatValue = useCallback(
        (amount: number) => {
            return getNumberFormatter({
                locale,
                style: "decimal",
                precision: 2,
                useGrouping: true,
            }).format(amount)
        },
        [locale],
    )

    return { formatLocale: locale, formatFiat, formatValue }
}
