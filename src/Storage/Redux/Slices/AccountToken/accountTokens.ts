import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { AccountTokenState, AccountToken } from "./types"

export const initialAccountTokenState: AccountTokenState = { fungible: [] }

export const AccountTokenSlice = createSlice({
    name: "accountTokens",
    initialState: initialAccountTokenState,
    reducers: {
        addAccountToken: (
            state: Draft<AccountTokenState>,
            action: PayloadAction<AccountToken>,
        ) => {
            state.fungible = [...state.fungible, action.payload]
        },
    },
})

export const { addAccountToken } = AccountTokenSlice.actions
