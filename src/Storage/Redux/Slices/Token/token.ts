import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { FungibleToken } from "~Model"
import { TokenState } from "./types"

export const initialTokenState: TokenState = { fungible: [] }

export const TokenSlice = createSlice({
    name: "tokens",
    initialState: initialTokenState,
    reducers: {
        updateFungibleTokens: (
            state: Draft<TokenState>,
            action: PayloadAction<FungibleToken[]>,
        ) => {
            state.fungible = action.payload
        },
    },
})

export const { updateFungibleTokens } = TokenSlice.actions
