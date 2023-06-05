import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
/**
 * Delegation State
 * @typedef {Object} DelegationState
 * @property {string[]} urls - urls array available for delegation
 */
export interface DelegationState {
    urls: string[]
    defaultDelegationOption: DelegationType
    defaultDelegationAccount?: AccountWithDevice
    defaultDelegationUrl?: string
}

const initialState: DelegationState = {
    urls: [],
    defaultDelegationOption: DelegationType.NONE,
    defaultDelegationAccount: undefined,
    defaultDelegationUrl: undefined,
}

export const DelegationSlice = createSlice({
    name: "delegation",
    initialState,
    reducers: {
        addDelegationUrl: (state, action: PayloadAction<string>) => {
            state.urls.push(action.payload)
        },
        deleteDelegationUrl: (state, action: PayloadAction<string>) => {
            state.urls = state.urls.filter(url => url !== action.payload)
        },
        setDefaultDelegationOption: (
            state,
            action: PayloadAction<DelegationType>,
        ) => {
            state.defaultDelegationOption = action.payload
        },
        setDefaultDelegationAccount: (
            state,
            action: PayloadAction<AccountWithDevice | undefined>,
        ) => {
            state.defaultDelegationAccount = action.payload
        },
        setDefaultDelegationUrl: (
            state,
            action: PayloadAction<string | undefined>,
        ) => {
            state.defaultDelegationUrl = action.payload
        },
    },
})

export const {
    addDelegationUrl,
    setDefaultDelegationOption,
    setDefaultDelegationAccount,
    setDefaultDelegationUrl,
    deleteDelegationUrl,
} = DelegationSlice.actions
