import { CURRENCY, CURRENCY_SYMBOLS, SYMBOL_POSITIONS } from "~Constants/Enums/CurrencyEnum"

export interface CurrencyConfig {
    currency: CURRENCY
    symbol: CURRENCY_SYMBOLS
    iconName: string
}

const fiatCurrencies: CurrencyConfig[] = []

fiatCurrencies.push({
    currency: CURRENCY.USD,
    symbol: CURRENCY_SYMBOLS.USD,
    iconName: "currency-usd",
})

fiatCurrencies.push({
    currency: CURRENCY.EUR,
    symbol: CURRENCY_SYMBOLS.EUR,
    iconName: "currency-eur",
})

export default [...fiatCurrencies].sort(function (a, b) {
    return a.currency.localeCompare(b.currency)
})

export const symbolPositions: SYMBOL_POSITIONS[] = [SYMBOL_POSITIONS.BEFORE, SYMBOL_POSITIONS.AFTER]

export const currencySymbolMap: Record<CURRENCY, CURRENCY_SYMBOLS> = {
    [CURRENCY.USD]: CURRENCY_SYMBOLS.USD,
    [CURRENCY.EUR]: CURRENCY_SYMBOLS.EUR,
}
