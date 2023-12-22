import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CurrencyState } from "../Types/Currency"

export const initialCurrencyState: CurrencyState = {
    availableCurrencies: [],
}

export const CurrencySlice = createSlice({
    name: "currencies",
    initialState: initialCurrencyState,
    reducers: {
        updateCurrency: (_, action: PayloadAction<CurrencyState>) => {
            return action.payload
        },
        updateAvailableCurrencies: (state, action: PayloadAction<string[]>) => {
            state.availableCurrencies = action.payload
        },
        resetCurrencyState: () => initialCurrencyState,
    },
})

export const { updateCurrency, updateAvailableCurrencies, resetCurrencyState } = CurrencySlice.actions
