/**
 * A model for storing exchange rates and other FIAT related info
 * @field `vet` - the VET {@link CurrencyExchangeRate}
 * @field `vtho` - the VTHO {@link CurrencyExchangeRate}
 * @field `availableCurrencies` - All available FIAT currencies
 */
export interface CurrencyCache {
    vet?: CurrencyExchangeRate
    vtho?: CurrencyExchangeRate
    availableCurrencies: string[]
}

/**
 * A model for storing exchange rates and other FIAT related info
 * @field `rate` - The exchange rate of the currency
 * @field `change` - The change in price as a percent
 */
export interface CurrencyExchangeRate {
    rate: number
    change?: number
}
