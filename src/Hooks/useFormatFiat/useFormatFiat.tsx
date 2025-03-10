import { useCallback, useMemo } from "react"
import { CURRENCY_FORMATS, CURRENCY_SYMBOLS, SYMBOL_POSITIONS } from "~Constants"
import CurrencyConfig from "~Constants/Constants/CurrencyConfig/CurrencyConfig"
import { selectCurrency, selectCurrencyFormat, selectSymbolPosition, useAppSelector } from "~Storage/Redux"
import { getLocales } from "react-native-localize"

type FormatFiatConfig = Omit<Intl.NumberFormatOptions, "style" | "currency">
type FormatFiatFuncArgs = {
    amount?: number
    cover?: boolean
    symbolPosition?: SYMBOL_POSITIONS
}

export const useFormatFiat = (intlOptions?: FormatFiatConfig) => {
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

    const renderCoveredBalances = useCallback((amount: string) => {
        // each digit is replaced by a dot + add two dots at the end to fill size differences
        return amount.replace(
            amount,
            amount
                .split("")
                .map(_l => "•")
                .join("") + "••",
        )
    }, [])

    const formatFiat = useCallback(
        ({ amount = 0, cover, symbolPosition: _spOverride }: FormatFiatFuncArgs) => {
            "worklet"

            const symbolPosition = _spOverride ?? mainSymbolPosition
            let formattedAmount = new Intl.NumberFormat(locale, {
                style: "decimal",
                currency,
                useGrouping: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                ...intlOptions,
            })
                .format(amount)
                .trim()

            const isAfter = symbolPosition === SYMBOL_POSITIONS.AFTER

            if (cover) {
                formattedAmount = renderCoveredBalances(formattedAmount)
            }

            let res: string
            if (isAfter) {
                // Move symbol after
                res = `${formattedAmount} ${symbol}`
            } else {
                res = `${symbol}${formattedAmount}`
            }

            return res
        },
        [mainSymbolPosition, locale, currency, intlOptions, symbol, renderCoveredBalances],
    )

    const formatValue = useCallback(
        (amount: number) => {
            return new Intl.NumberFormat(locale, {
                style: "decimal",
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
                useGrouping: true,
            }).format(amount)
        },
        [locale],
    )

    return { formatLocale: locale, formatFiat, formatValue }
}
