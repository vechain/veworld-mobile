import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type B3moExecutionMode = "auto" | "confirm"

export interface B3moState {
    linkedAddress?: string
    onboardingAcceptedAt?: number
    executionMode: B3moExecutionMode
}

export const initialB3moState: B3moState = {
    executionMode: "confirm",
}

export const B3moSlice = createSlice({
    name: "b3mo",
    initialState: initialB3moState,
    reducers: {
        setB3moLinkedAddress: (state, action: PayloadAction<{ address: string }>) => {
            state.linkedAddress = action.payload.address.toLowerCase()
            state.onboardingAcceptedAt = state.onboardingAcceptedAt ?? Date.now()
        },
        acceptB3moDisclaimer: state => {
            state.onboardingAcceptedAt = Date.now()
        },
        setB3moExecutionMode: (state, action: PayloadAction<{ mode: B3moExecutionMode }>) => {
            state.executionMode = action.payload.mode
        },
        clearB3moLink: state => {
            state.linkedAddress = undefined
        },
        resetB3moState: () => initialB3moState,
    },
})

export const { setB3moLinkedAddress, acceptB3moDisclaimer, setB3moExecutionMode, clearB3moLink, resetB3moState } =
    B3moSlice.actions
