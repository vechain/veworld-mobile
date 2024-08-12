import { useCallback, useMemo } from "react"
import { CURRENCY, CURRENCY_SYMBOLS } from "~Constants"
import CurrencyConfig from "~Constants/Constants/CurrencyConfig/CurrencyConfig"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

type FormatFiatConfig = Omit<Intl.NumberFormatOptions, "style" | "currency">
type FormatFiatFuncArgs = {
    amount?: number
    cover?: boolean
}

export const useFormatFiat = (intlOptions?: FormatFiatConfig) => {
    let local: string

    const c = useAppSelector(selectCurrency)
    const { currency } = useMemo(
        () => CurrencyConfig.find(config => config.currency === c) || { currency: CurrencyConfig[0].currency },
        [c],
    )

    // const symbolPosition = SYMBOL_POSITIONS.BEFORE
    const isAfter = false // useMemo(() => symbolPosition === SYMBOL_POSITIONS.AFTER, [symbolPosition])

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
        ({ amount = 0, cover }: FormatFiatFuncArgs) => {
            "worklet"
            let formattedAmount = new Intl.NumberFormat(local, {
                style: "currency",
                currency,
                ...intlOptions,
            }).format(amount)

            const symbol = CURRENCY_SYMBOLS[currency]
            const amountWithoutSymbol = formattedAmount.replace(symbol, "").trim()

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

            if (isAfter) {
                // Move symbol after
                return `${amountWithoutSymbol} ${symbol}`
            } else {
                return formattedAmount
            }
        },
        [currency, local, isAfter, intlOptions],
    )

    return { formatFiat }
}
