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
        clearVetExchangeRate: state => {
            delete state.vet
        },
        updateVthoExchangeRate: (
            state,
            action: PayloadAction<CurrencyExchangeRate>,
        ) => {
            state.vtho = action.payload
        },
        clearVthoExchangeRate: state => {
            delete state.vtho
        },
        updateAvailableCurrencies: (state, action: PayloadAction<string[]>) => {
            state.availableCurrencies = action.payload
        },
    },
})

export const {
    updateCurrency,
    updateVetExchangeRate,
    clearVetExchangeRate,
    updateVthoExchangeRate,
    clearVthoExchangeRate,
    updateAvailableCurrencies,
} = currencySlice.actions
