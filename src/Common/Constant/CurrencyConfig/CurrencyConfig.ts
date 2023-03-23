import { CURRENCY, CURRENCY_SYMBOLS } from "~Common/Enums"

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
