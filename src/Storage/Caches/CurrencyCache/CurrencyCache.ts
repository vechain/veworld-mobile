import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CurrencyCache, CurrencyExchangeRate } from "~Model/Currency"
import { RootState } from "~Storage/Caches/cache"

export const initialCurrencyState: CurrencyCache = {
    availableCurrencies: [],
}

export const currencySlice = createSlice({
    name: "currency",
    initialState: initialCurrencyState,
    reducers: {
        updateCurrency: (_, action: PayloadAction<CurrencyCache>) => {
            return action.payload
        },
    },
})

export const { updateCurrency } = currencySlice.actions

export const getExchangeRate =
    (symbol: string) =>
    (state: RootState): CurrencyExchangeRate | undefined => {
        if (symbol === "VET") return state.currency.vet
        if (symbol === "VTHO") return state.currency.vtho
    }
