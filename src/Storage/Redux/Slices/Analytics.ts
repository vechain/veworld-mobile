import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface AnalyticsState {
    currentScreen: string
}

const initialState: AnalyticsState = {
    currentScreen: "",
}

export const AnalyticsSlice = createSlice({
    name: "analytics",
    initialState,
    reducers: {
        setScreen: (state, action: PayloadAction<string>) => {
            state.currentScreen = action.payload
        },

        resetAnalyticsState: () => initialState,
    },
})

export const { setScreen, resetAnalyticsState } = AnalyticsSlice.actions
