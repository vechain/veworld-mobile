/**
 * A model for storing exchange rates and other FIAT related info
 * @field `rate` - The exchange rate of the currency
 * @field `change` - The change in price as a percent
 */
export interface CurrencyExchangeRate {
    rate?: number
    change?: number
    coinGeckoId?: string
    symbol?: string
}
