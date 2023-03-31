import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

export const getCurrency = (state: RootState) => state.currency

export const getCurrencyExchangeRate = createSelector(
    [getCurrency, (_, symbol: string) => symbol],
    (currency, symbol) => {
        if (symbol === "VET") return currency.vet
        if (symbol === "VTHO") return currency.vtho
    },
)
