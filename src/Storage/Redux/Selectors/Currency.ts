import { createSelector } from "@reduxjs/toolkit"
import { VeChainToken } from "~Model"
import { RootState } from "../Types"

export const getCurrency = (state: RootState) => state.currency

export const getCurrencyExchangeRate = createSelector(
    [getCurrency, (_, symbol: VeChainToken) => symbol],
    (currency, symbol) => {
        return currency[symbol]
    },
)
