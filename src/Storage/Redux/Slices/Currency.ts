import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CurrencyExchangeRate, VeChainToken } from "~Model"
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
        updateExchangeRate: (
            state,
            action: PayloadAction<{
                token: VeChainToken
                rate: CurrencyExchangeRate
            }>,
        ) => {
            const { token, rate } = action.payload
            state[token] = rate
        },
        updateAvailableCurrencies: (state, action: PayloadAction<string[]>) => {
            state.availableCurrencies = action.payload
        },
        clearExchangeRate: (state, action: PayloadAction<VeChainToken>) => {
            delete state[action.payload]
        },
    },
})

export const {
    updateCurrency,
    updateExchangeRate,
    clearExchangeRate,
    updateAvailableCurrencies,
} = currencySlice.actions
