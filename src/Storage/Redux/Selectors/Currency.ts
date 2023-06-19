import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

export const getCurrency = (state: RootState) => state.currencies

export const selectCurrencyExchangeRate = createSelector(
    [getCurrency, (_, symbol: string) => symbol],
    (currency, symbol) =>
        currency.exchangeRates?.find(
            rate => rate?.symbol?.toLowerCase() === symbol.toLowerCase(),
        ),
)

export const selectAllExchangeRates = createSelector(
    getCurrency,
    state => state.exchangeRates,
)
