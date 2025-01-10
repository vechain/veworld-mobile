import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type ConnectedAppAccountsState = { [key: string]: string[] }
export const initialConnectedAppAccountsState: ConnectedAppAccountsState = {}

export const connectedAppAccountSlice = createSlice({
    name: "connectedAppAccounts",
    initialState: initialConnectedAppAccountsState,
    reducers: {
        updateConnectedAppAccounts: (state, action: PayloadAction<ConnectedAppAccountsState>) => {
            return action.payload
        },
        updateConnectedAppAccount: (state, action: PayloadAction<{ origin: string; address: string }>) => {
            const { origin, address } = action.payload
            state[origin] = [...state[origin], address]
        },
    },
})

export const { updateConnectedAppAccounts, updateConnectedAppAccount } = connectedAppAccountSlice.actions
