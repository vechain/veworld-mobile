import { useCallback, useMemo } from "react"
import { CURRENCY, CURRENCY_SYMBOLS, SYMBOL_POSITIONS } from "~Constants"
import CurrencyConfig from "~Constants/Constants/CurrencyConfig/CurrencyConfig"
import { selectCurrency, selectSymbolPosition, useAppSelector } from "~Storage/Redux"

type FormatFiatConfig = Omit<Intl.NumberFormatOptions, "style" | "currency">
type FormatFiatFuncArgs = {
    amount?: number
    cover?: boolean
    symbolPosition?: SYMBOL_POSITIONS
}

export const useFormatFiat = (intlOptions?: FormatFiatConfig) => {
    let local: string

    const c = useAppSelector(selectCurrency)
    const mainSymbolPosition = useAppSelector(selectSymbolPosition)
    const { currency } = useMemo(
        () => CurrencyConfig.find(config => config.currency === c) || { currency: CurrencyConfig[0].currency },
        [c],
    )

    // default currencies formatting, keep it like that
    switch (currency) {
        case CURRENCY.EUR:
            local = "nl-BE"
            break
        case CURRENCY.USD:
            local = "en-US"
            break
    }

    const formatFiat = useCallback(
        ({ amount = 0, cover, symbolPosition: _spOverride }: FormatFiatFuncArgs) => {
            "worklet"

            const symbolPosition = _spOverride ?? mainSymbolPosition

            let formattedAmount = new Intl.NumberFormat(local, {
                style: "currency",
                currency,
                useGrouping: true,
                ...intlOptions,
            }).format(amount)

            const symbol = CURRENCY_SYMBOLS[currency]
            let amountWithoutSymbol = formattedAmount
                .replace(symbol, "") // remove the symbol from string
                .trim()

            const isAfter = symbolPosition === SYMBOL_POSITIONS.AFTER

            if (cover) {
                // each digit is replaced by a dot + add two dots at the end to fill size differences
                formattedAmount = formattedAmount.replace(
                    amountWithoutSymbol,
                    amountWithoutSymbol
                        .split("")
                        .map(_l => "•")
                        .join("") + "••",
                )
            }

            let res: string
            if (isAfter) {
                // Move symbol after
                res = `${amountWithoutSymbol} ${symbol}`
            } else {
                res = formattedAmount
            }

            if (intlOptions?.minimumFractionDigits && intlOptions?.minimumFractionDigits > 2) {
                // remove any comma after the first one if it's a number with many decimals
                res = res
            }
            return res
        },
        [mainSymbolPosition, local, currency, intlOptions],
    )

    return { formatFiat }
}
