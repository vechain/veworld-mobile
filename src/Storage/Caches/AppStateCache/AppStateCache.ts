import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppState } from "~Model"

export const initialAppState: AppState = {
    currentState: "inactive",
    previousState: "unknown",
}

export const appStateSlice = createSlice({
    name: "appState",
    initialState: initialAppState,
    reducers: {
        updateAppState: (state, action: PayloadAction<AppState>) => {
            state.currentState = action.payload.currentState
            state.previousState = action.payload.previousState
        },
    },
})

export const { updateAppState } = appStateSlice.actions
