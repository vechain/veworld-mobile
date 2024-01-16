import { CurrencyExchangeRate } from "~Model"

/**
 * A model for storing exchange rates and other FIAT related info
 * @field `vet` - the VET {@link CurrencyExchangeRate}
 * @field `vtho` - the VTHO {@link CurrencyExchangeRate}
 * @field `availableCurrencies` - All available FIAT currencies
 */
export interface CurrencyState {
    VET?: CurrencyExchangeRate
    VTHO?: CurrencyExchangeRate
    availableCurrencies: string[]
}
