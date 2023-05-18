import { createSlice, PayloadAction } from "@reduxjs/toolkit"
/**
 * Delegation State
 * @typedef {Object} DelegationState
 * @property {string[]} urls - urls array available for delegation
 */
export interface DelegationState {
    urls: string[]
}

const initialState: DelegationState = {
    urls: [],
}

export const DelegationSlice = createSlice({
    name: "delegation",
    initialState,
    reducers: {
        addDelegationUrl: (state, action: PayloadAction<string>) => {
            state.urls.push(action.payload)
        },
    },
})

export const { addDelegationUrl } = DelegationSlice.actions
