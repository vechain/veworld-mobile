import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CurrencyExchangeRate } from "~Model"
import { CurrencyState } from "../Types/Currency"

export const initialCurrencyState: CurrencyState = {
    availableCurrencies: [],
    exchangeRates: [],
}

export const CurrencySlice = createSlice({
    name: "currencies",
    initialState: initialCurrencyState,
    reducers: {
        updateCurrency: (_, action: PayloadAction<CurrencyState>) => {
            return action.payload
        },
        updateExchangeRate: (
            state,
            action: PayloadAction<CurrencyExchangeRate[]>,
        ) => {
            state.exchangeRates = action.payload
        },
        updateAvailableCurrencies: (state, action: PayloadAction<string[]>) => {
            state.availableCurrencies = action.payload
        },
        clearExchangeRate: state => {
            state.exchangeRates = []
        },
    },
})

export const {
    updateCurrency,
    updateExchangeRate,
    clearExchangeRate,
    updateAvailableCurrencies,
} = CurrencySlice.actions
