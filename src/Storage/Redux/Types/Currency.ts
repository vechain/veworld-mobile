import { CurrencyExchangeRate } from "~Model"

/**
 * A model for storing exchange rates and other FIAT related info
 * @field `availableCurrencies` - All available FIAT currencies
 * @field `exchangeRates` - All exchange rates
 */
export interface CurrencyState {
    availableCurrencies: string[]
    exchangeRates: CurrencyExchangeRate[]
}
