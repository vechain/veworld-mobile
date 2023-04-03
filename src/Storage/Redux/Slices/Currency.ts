import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CurrencyExchangeRate } from "~Model"
import { CurrencyState } from "../Types/Currency"

export const initialCurrencyState: CurrencyState = {
    availableCurrencies: [],
}

export const currencySlice = createSlice({
    name: "currency",
    initialState: initialCurrencyState,
    reducers: {
        updateCurrency: (_, action: PayloadAction<CurrencyState>) => {
            return action.payload
        },
        updateVetExchangeRate: (
            state,
            action: PayloadAction<CurrencyExchangeRate>,
        ) => {
            state.vet = action.payload
        },
        updateVthoExchangeRate: (
            state,
            action: PayloadAction<CurrencyExchangeRate>,
        ) => {
            state.vtho = action.payload
        },
        updateAvailableCurrencies: (state, action: PayloadAction<string[]>) => {
            state.availableCurrencies = action.payload
        },
        clearExchangeRate: (state, action: PayloadAction<"vet" | "vtho">) => {
            delete state[action.payload]
        },
    },
})

export const {
    updateCurrency,
    updateVetExchangeRate,
    clearExchangeRate,
    updateVthoExchangeRate,
    updateAvailableCurrencies,
} = currencySlice.actions
