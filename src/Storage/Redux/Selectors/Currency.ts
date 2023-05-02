import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { CurrencySlice } from "../Slices"

export const getCurrency = (state: RootState) => state[CurrencySlice.name]

export const selectCurrencyExchangeRate = createSelector(
    [getCurrency, (_, symbol: string) => symbol],
    (currency, symbol) =>
        currency?.exchangeRates.find(rate => rate?.symbol === symbol),
)

export const selectAllExchangeRates = createSelector(getCurrency, state => {
    return state.exchangeRates
})
