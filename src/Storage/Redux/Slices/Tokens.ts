import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { FungibleToken } from "~Model"
import { TokensState } from "../Types"

export const initialTokenState: TokensState = {
    custom: [],
}

export const TokenSlice = createSlice({
    name: "tokens",
    initialState: initialTokenState,
    reducers: {
        updateCustomTokens: (state, action: PayloadAction<FungibleToken[]>) => {
            state.custom = action.payload
        },
        addCustomToken: (state, action: PayloadAction<FungibleToken>) => {
            state.custom.push(action.payload)
        },
    },
})

export const { updateCustomTokens, addCustomToken } = TokenSlice.actions
