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
    },
})

export const { updateConnectedAppAccounts } = connectedAppAccountSlice.actions
